/**
 * Copyright © 2015,2016 STRG.AT GmbH, Vienna, Austria
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

// Universal Module Loader
// https://github.com/umdjs/umd
// https://github.com/umdjs/umd/blob/v1.0.0/returnExports.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['bluebird', 'score.init', 'score.dom', 'score.oop'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        factory(require('bluebird'), require('score.init'), require('score.dom'), require('score.oop'));
    } else {
        // Browser globals (root is window)
        factory(Promise, root.score);
    }
})(this, function(Promise, score) {

    score.extend('dom.state', ['dom', 'oop'], function() {

        var hash = function(value, visited) {
            if (typeof visited === 'undefined') {
                visited = [];
            }
            var index = visited.indexOf(value);
            if (index >= 0) {
                return '__visited__[' + index + ']';
            }
            visited.push(value);
            if (value instanceof Array) {
                value = value.slice(0);
                value.unshift('__list_hash__');
            } else if (typeof value === 'object') {
                var keys = [];
                var values = [];
                for (var k in value) {
                    if (value.hasOwnProperty(k)) {
                        keys.push(k);
                    }
                }
                keys.sort();
                for (var i = 0; i < keys.length; i++) {
                    values.push(hash(value[keys[i]], visited));
                }
                value = ['__dict_hash__', keys, values];
            }
            if (arguments[1]) {
                return value;
            }
            return JSON.stringify(value);
        };

        var Cancel = function() {
        };
        Cancel.prototype = Object.create(Error.prototype);
        Cancel.prototype.constructor = Cancel;

        var Group = score.oop.Class({
            __name__: 'StateGroup',

            __init__: function(self, node) {
                self.node = score.dom(node);
                self.node.addClass('score-state-group');
                self.activeState = null;
                self.states = {};
            },

            _activate: function(self, state) {
                if (self.activationPromise) {
                    if (self.activationPromise.state === state) {
                        return self.activationPromise;
                    }
                    return self.activationPromise.then(function() {
                        self._activate(state);
                    });
                }
                if (state === self.activeState) {
                    return Promise.resolve();
                }
                var promise = Promise.resolve();
                if (typeof promise.cancellable === 'function') {
                    promise = promise.cancellable();
                }
                if (self.activeState !== null) {
                    promise = promise.then(function() {
                        if (!self.activeState.trigger('deactivate')) {
                            throw new Promise.CancellationError();
                        }
                        return Promise.resolve().then(function() {
                            return self.activeState._deactivate();
                        }).catch(Cancel, function() {
                            throw new Promise.CancellationError();
                        }).then(function() {
                            // race conditions were clearing activeState
                            if (!self.activeState) {
                                return;
                            }
                            if (self.activeState.node) {
                                self.activeState.node.removeClass('score-state--active');
                            }
                            if (self.node) {
                                self.node.removeClass('score-state-group--' + self.activeState.name);
                            }
                            self.activeState = null;
                        });
                    });
                }
                self.activationPromise = promise.then(function() {
                    self.activeState = state;
                    if (self.node) {
                        self.node.addClass('score-state-group--' + state.name);
                    }
                    if (state.node) {
                        state.node.addClass('score-state--active');
                    }
                    return state._activate();
                }).then(function() {
                    state.trigger('activate');
                    self.activationPromise = null;
                });
                self.activationPromise.state = state;
                return self.activationPromise;
            },

            _register: function(self, state) {
                if (state.name in self.states) {
                    throw new Error('State with the name ' + state.name + ' already registered!');
                }
                self.states[state.name] = state;
            },

            show: function(self, state) {
                if (typeof state === 'string') {
                    if (typeof self.states[state] === 'undefined') {
                        throw new Error('State ' + state + ' does not exist!');
                    }
                    state = self.states[state];
                } else if (!(state instanceof state.State)) {
                    throw new Error('Argument must be a state, or the name of a state!');
                }
                var args = [];
                for (var i = 2; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                return state.show.apply(state, args);
            }

        });

        var state = score.oop.Class({
            __name__: 'State',
            __events__: ['init', 'load', 'activate', 'deactivate'],

            __init__: function(self, group, name, node) {
                if (!(group instanceof state.Group)) {
                    throw new Error('First argument must be a state.Group object!');
                }
                if (typeof name !== 'string') {
                    throw new Error('Name not a string!');
                }
                if (node) {
                    self.node = score.dom(node);
                    self.node.addClass('score-state');
                }
                self.group = group;
                self.name = name;
                self.initialized = false;
                self.group._register(self);
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
                    return self.group._activate(self);
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

        });

        state.Group = Group;

        return state;

    });

});
