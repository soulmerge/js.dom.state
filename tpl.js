define('lib/score/tpl', ['lib/score/oop', 'lib/score/hash', 'lib/bluebird'], function(oop, hash, Promise) {

    var Cancel = function() {
    };
    Cancel.prototype = Object.create(Error.prototype);
    Cancel.prototype.constructor = Cancel;

    var tpl = {

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
                                self.activetpl.node.className = self.activetpl.node.className.replace(/\s*\btpl-active\b\s*/, '');
                            }
                            if (self.node) {
                                self.node.className = self.node.className.replace(
                                        new RegExp('\\s*\\btpl-active-' + self.activetpl.name + '\\b\\s*'), '');
                            }
                            self.activetpl = null;
                        });
                    });
                }
                return promise.then(function() {
                    self.activetpl = tpl;
                    if (self.node) {
                        self.node.className = self.node.className + ' tpl-active-' + self.activetpl.name;
                    }
                    if (self.activetpl.node) {
                        self.activetpl.node.className = self.activetpl.node.className + ' tpl-active';
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
                    node.className = node.className + ' tpl';
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
