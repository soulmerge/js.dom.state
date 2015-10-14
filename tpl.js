/**
 * Copyright © 2015 STRG.AT GmbH, Vienna, Austria
 *
 * This file is part of the The SCORE Framework.
 *
 * The SCORE Framework and all its parts are free software: you can redistribute
 * them and/or modify them under the terms of the GNU Lesser General Public
 * License version 3 as published by the Free Software Foundation which is in the
 * file named COPYING.LESSER.txt.
 *
 * The SCORE Framework and all its parts are distributed without any WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. For more details see the GNU Lesser General Public
 * License.
 *
 * If you have not received a copy of the GNU Lesser General Public License see
 * http://www.gnu.org/licenses/.
 *
 * The License-Agreement realised between you as Licensee and STRG.AT GmbH as
 * Licenser including the issue of its valid conclusion and its pre- and
 * post-contractual effects is governed by the laws of Austria. Any disputes
 * concerning this License-Agreement including the issue of its valid conclusion
 * and its pre- and post-contractual effects are exclusively decided by the
 * competent court, in whose district STRG.AT GmbH has its registered seat, at
 * the discretion of STRG.AT GmbH also the competent court, in whose district the
 * Licensee has his registered seat, an establishment or assets.
 */

define('lib/score/tpl', ['lib/score/oop', 'lib/score/hash', 'lib/bluebird', 'lib/css.js'], function(oop, hash, Promise, css) {

    var Cancel = function() {
    };
    Cancel.prototype = Object.create(Error.prototype);
    Cancel.prototype.constructor = Cancel;

    var tpl = {

        VERSION: "0.1.1",

        Cancel: new Cancel(),

        Root: oop.Class({
            __name__: 'TemplateRoot',

            __init__: function(self, node) {
                self.node = node;
                self.activetpl = null;
                self.templates = {};
            },

            _activate: function(self, tpl) {
                if (tpl === self.activetpl) {
                    return;
                }
                var promise = Promise.resolve().cancellable();
                if (self.activetpl !== null) {
                    promise = promise.then(function() {
                        if (!self.activetpl.trigger('deactivate')) {
                            throw new Promise.CancellationError();
                        }
                        return Promise.resolve().then(function() {
                            return self.activetpl._deactivate();
                        }).catch(Cancel, function() {
                            throw new Promise.CancellationError();
                        }).then(function() {
                            // race conditions were clearing activetpl
                            if (!self.activetpl) {
                                return;
                            }
                            if (self.activetpl.node) {
                                css.removeClass(self.activetpl.node, 'tpl-active');
                            }
                            if (self.node) {
                                css.removeClass(self.node, 'tpl-active-' + self.activetpl.name);
                            }
                            self.activetpl = null;
                        });
                    });
                }
                return promise.then(function() {
                    self.activetpl = tpl;
                    if (self.node) {
                        css.addClass(self.node, 'tpl-active-' + self.activetpl.name);
                    }
                    if (self.activetpl.node) {
                        css.addClass(self.activetpl.node, 'tpl-active');
                    }
                    return Promise.resolve(self.activetpl._activate()).then(function() {
                        self.activetpl.trigger('activate');
                    });
                });
            },

            _register: function(self, tpl) {
                if (tpl.name in self.templates) {
                    throw new Error('Template with the name ' + tpl.name + ' already registered!');
                }
                self.templates[tpl.name] = tpl;
            },

            show: function(self, tpl_) {
                if (typeof tpl_ === 'string') {
                    if (typeof self.templates[tpl_] === 'undefined') {
                        throw new Error('Template ' + tpl_ + ' does not exist!');
                    }
                    tpl_ = self.templates[tpl_];
                } else if (!(tpl_ instanceof tpl.Template)) {
                    throw new Error('Argument must be a template, or the name of a template!');
                }
                var args = [];
                for (var i = 2; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                return tpl_.show.apply(tpl_, args);
            }

        }),

        Template: oop.Class({
            __name__: 'Template',
            __events__: ['init', 'load', 'activate', 'deactivate'],

            __init__: function(self, root, name, node) {
                if (!(root instanceof tpl.Root)) {
                    throw new Error('First argument must be a tpl.Root object!');
                }
                if (typeof name !== 'string') {
                    throw new Error('Name not a string!');
                }
                if (node) {
                    css.addClass(node, 'tpl');
                    self.node = node;
                }
                self.root = root;
                self.name = name;
                self.initialized = false;
                self.root._register(self);
            },

            show: function(self) {
                var args = [];
                for (var i = 1; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                var promise = Promise.resolve();
                if (!self.initialized) {
                    promise = promise.then(function() {
                        return Promise.resolve(self._init()).then(function() {
                            self.initialized = true;
                            self.trigger('init');
                        });
                    });
                }
                if (hash(args) !== hash(self.args)) {
                    promise = promise.then(function() {
                        return Promise.resolve(self._load.apply(self, args)).then(function() {
                            self.trigger('load', args);
                        });
                    });
                }
                return promise.then(function() {
                    self.args = args;
                    return self.root._activate(self);
                });
            },

            _init: function() {
            },

            _load: function(/* args */) {
            },

            _deactivate: function() {
            },

            _activate: function() {
            }

        })
    };

    return tpl;

});
