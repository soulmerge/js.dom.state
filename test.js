if (typeof loadScore == 'undefined') {
    /* globals loadScore:true, expect: true */
    var tmp = require('./node.js');
    loadScore = tmp.loadScore;
    expect = tmp.expect;
}

/* globals describe, it, expect, before, after */

describe('score.dom', function() {

    describe('module', function() {

        it('should add the score.dom.state object', function(done) {
            loadScore(['oop', 'dom'], function(score) {
                try {
                    expect(score).to.be.an('object');
                    expect(score.dom).to.be.a('function');
                    expect(score.dom.state).to.be(undefined);
                    loadScore(['oop', 'dom', 'dom.state'], function(score) {
                        try {
                            expect(score).to.be.an('object');
                            expect(score.dom).to.be.a('function');
                            expect(score.dom.state).to.be.an('object');
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
                } catch (e) {
                    done(e);
                }
            });
        });

        it('should provide the "Group" and "state" classes', function(done) {
            loadScore(['oop', 'dom', 'dom.state'], function(score) {
                try {
                    expect(score.dom.state).to.be.an('object');
                    expect(score.dom.state.State).to.be.a('function');
                    expect(score.dom.state.Group).to.be.a('function');
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

    });

    describe('Group', function() {

        before(function() {
            var fixture = document.getElementById('fixture');
            fixture.innerHTML = 
                '<div class="fixture-group"> <!-- the group -->' +
                '    <div class="fixture-state"> <!-- a state -->' +
                '    </div>' +
                '    <div class="fixture-state"> <!-- another state -->' +
                '    </div>' +
                '</div>';
        });

        after(function() {
            document.getElementById('fixture').innerHTML = '';
        });

        describe('constructor', function() {

            it('should set css classes', function(done) {
                loadScore(['oop', 'dom', 'dom.state'], function(score) {
                    try {
                        var node = score.dom('#fixture .fixture-group');
                        expect(node.hasClass('score-state-group')).to.be(false);
                        score.dom.state.Group(node);
                        expect(node.hasClass('score-state-group')).to.be(true);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it('should provide a node member', function(done) {
                loadScore(['oop', 'dom', 'dom.state'], function(score) {
                    try {
                        var node = score.dom('#fixture .fixture-group');
                        var group = score.dom.state.Group(node);
                        expect(group.node).to.be(node);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it('should not change the node content', function(done) {
                loadScore(['oop', 'dom', 'dom.state'], function(score) {
                    try {
                        var node = score.dom('#fixture .fixture-group');
                        var prevHTML = node.DOMNode.innerHTML;
                        score.dom.state.Group(node);
                        expect(node.DOMNode.innerHTML).to.be(prevHTML);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

        });

        describe('defineState', function() {

            it('should return a State object', function(done) {
                loadScore(['oop', 'dom', 'dom.state'], function(score) {
                    try {
                        var node = score.dom('#fixture .fixture-group');
                        var group = score.dom.state.Group(node);
                        var state1Node = score.dom('#fixture .fixture-state').first;
                        var state1 = group.defineState('state1', state1Node);
                        expect(state1).to.be.a(score.dom.state.State);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it('should not accept duplicate states', function(done) {
                loadScore(['oop', 'dom', 'dom.state'], function(score) {
                    try {
                        var node = score.dom('#fixture .fixture-group');
                        var group = score.dom.state.Group(node);
                        var state1Node = score.dom('#fixture .fixture-state').first;
                        var state1 = group.defineState('SAMENAME', state1Node);
                        expect(state1).to.be.a(score.dom.state.State);
                        expect(function() { group.defineState('SAMENAME', state1Node); }).to.throwError();
                        expect(function() { score.dom.state.State(group, 'SAMENAME', state1Node); }).to.throwError();
                        var state2Node = score.dom('#fixture .fixture-state').eq(1);
                        expect(function() { group.defineState('SAMENAME', state2Node); }).to.throwError();
                        expect(function() { score.dom.state.State(group, 'SAMENAME', state2Node); }).to.throwError();
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

        });

    });

    describe('State', function() {

        describe('constructor', function() {

            before(function() {
                var fixture = document.getElementById('fixture');
                fixture.innerHTML = 
                    '<div class="fixture-group"> <!-- the group -->' +
                    '    <div class="fixture-state fixture-state-1"> <!-- a state -->' +
                    '    </div>' +
                    '    <div class="fixture-state"> <!-- another state -->' +
                    '    </div>' +
                    '</div>';
            });

            after(function() {
                document.getElementById('fixture').innerHTML = '';
            });

            it('should set css classes', function(done) {
                loadScore(['oop', 'dom', 'dom.state'], function(score) {
                    try {
                        var stateNode = score.dom('#fixture .fixture-group');
                        var state1Node = score.dom('#fixture .fixture-state').first;
                        var state2Node = score.dom('#fixture .fixture-state').eq(1);
                        expect(state1Node.hasClass('score-state')).to.be(false);
                        expect(state2Node.hasClass('score-state')).to.be(false);
                        var group = score.dom.state.Group(stateNode);
                        expect(state1Node.hasClass('score-state')).to.be(false);
                        expect(state2Node.hasClass('score-state')).to.be(false);
                        score.dom.state.State(group, 'state1', state1Node);
                        expect(state1Node.hasClass('score-state')).to.be(true);
                        expect(state2Node.hasClass('score-state')).to.be(false);
                        score.dom.state.State(group, 'state2', state2Node);
                        expect(state1Node.hasClass('score-state')).to.be(true);
                        expect(state2Node.hasClass('score-state')).to.be(true);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it('should provide a node member', function(done) {
                loadScore(['oop', 'dom', 'dom.state'], function(score) {
                    try {
                        var stateNode = score.dom('#fixture .fixture-group');
                        var group = score.dom.state.Group(stateNode);
                        var state1Node = score.dom('#fixture .fixture-state').first;
                        var state2Node = score.dom('#fixture .fixture-state').eq(1);
                        var state1 = score.dom.state.State(group, 'state1', state1Node);
                        var state2 = score.dom.state.State(group, 'state2', state2Node);
                        expect(state1.node).to.be(state1Node);
                        expect(state2.node).to.be(state2Node);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it('should refuse duplicate state names', function(done) {
                loadScore(['oop', 'dom', 'dom.state'], function(score) {
                    try {
                        var stateNode = score.dom('#fixture .fixture-group');
                        var group = score.dom.state.Group(stateNode);
                        var state1Node = score.dom('#fixture .fixture-state').first;
                        var state2Node = score.dom('#fixture .fixture-state').eq(1);
                        score.dom.state.State(group, 'SAMENAME', state1Node);
                        expect(function() { score.dom.state.State(group, 'SAMENAME', state2Node); }).to.throwError();
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it('should not change the node content', function(done) {
                loadScore(['oop', 'dom', 'dom.state'], function(score) {
                    try {
                        var stateNode = score.dom('#fixture .fixture-group');
                        var group = score.dom.state.Group(stateNode);
                        var state1Node = score.dom('#fixture .fixture-state').first;
                        var prevHTML = state1Node.DOMNode.innerHTML;
                        score.dom.state.State(group, 'state1', state1Node);
                        expect(state1Node.DOMNode.innerHTML).to.be(prevHTML);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

        });

    });

});

