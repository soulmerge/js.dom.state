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
                if (!state.initialized) {
                    promise = promise.then(function() {
                        return state._init();
                    }).then(function() {
                        state.trigger('init');
                        state.initialized = true;
                    });
                }
                if (self.activeState !== null) {
                    promise = promise.then(function() {
                        if (!self.activeState.trigger('deactivate')) {
                            throw new Promise.CancellationError();
                        }
                        return self.activeState._deactivate();
                    }).then(function() {
                        if (self.activeState.node) {
                            self.activeState.node.removeClass('score-state--active');
                        }
                        if (self.node) {
                            self.node.removeClass('score-state-group--' + self.activeState.name);
                        }
                        self.activeState = null;
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
                } else if (!(state instanceof State)) {
                    throw new Error('Argument must be a state, or the name of a state!');
                }
                return self._activate(state);
            }

        });

        var State = score.oop.Class({
            __name__: 'State',
            __events__: ['init', 'activate', 'deactivate'],

            __init__: function(self, group, name, node) {
                if (!(group instanceof State.Group)) {
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
                return self.group._activate(self);
            },

            _init: function() {
            },

            _activate: function() {
            },

            _deactivate: function() {
            }

        });

        var ActivatedGroup = score.oop.Class({
            __name__: 'ActivatedStateGroup',
            __parent__: Group,
            __events__: ['show', 'hide'],

            __init__: function(self, node) {
                self.__super__(node);
                new InactiveState(self);
                self.hide();
            },

            hide: function(self) {
                return self.show('inactive');
            }

        });

        var InactiveState = score.oop.Class({
            __name__: 'InactiveState',
            __parent__: State,

            __init__: function(self, group) {
                self.__super__(group, 'inactive');
            },

            _activate: function(self) {
                self.group.trigger('hide');
            },

            _deactivate: function(self) {
                self.group.trigger('show');
            }

        });

        State.Group = Group;

        State.ActivatedGroup = ActivatedGroup;

        return State;

    });

});
