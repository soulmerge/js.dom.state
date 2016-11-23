if (typeof loadScore == 'undefined') {
    /* globals loadScore:true, expect: true */
    var tmp = require('./node.js');
    loadScore = tmp.loadScore;
    expect = tmp.expect;
}

/* globals describe, it, expect, before, after */

describe('score.dom', function() {

    describe('module', function() {

        it('should add the score.dom.theater object', function(done) {
            loadScore(['oop', 'dom'], function(score) {
                try {
                    expect(score).to.be.an('object');
                    expect(score.dom).to.be.a('function');
                    expect(score.dom.theater).to.be(undefined);
                    loadScore(['oop', 'dom', 'dom.theater'], function(score) {
                        try {
                            expect(score).to.be.an('object');
                            expect(score.dom).to.be.a('function');
                            expect(score.dom.theater).to.be.an('object');
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

        it('should provide the "Stage" and "Scene" classes', function(done) {
            loadScore(['oop', 'dom', 'dom.theater'], function(score) {
                try {
                    expect(score.dom.theater.Stage).to.be.a('function');
                    expect(score.dom.theater.Scene).to.be.a('function');
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

    });

    describe('Stage constructor', function() {

        before(function() {
            var fixture = document.getElementById('fixture');
            fixture.innerHTML = 
                '<div class="fixture-stage"> <!-- the stage -->' +
                '    <div class="fixture-scene"> <!-- a scene -->' +
                '    </div>' +
                '    <div class="fixture-scene"> <!-- another scene -->' +
                '    </div>' +
                '</div>';
        });

        after(function() {
            var fixture = document.getElementById('fixture');
            while (fixture.children.length) {
                fixture.removeChild(fixture.children[0]);
            }
        });

        it('should set css classes', function(done) {
            loadScore(['oop', 'dom', 'dom.theater'], function(score) {
                try {
                    var node = score.dom('#fixture .fixture-stage');
                    expect(node.hasClass('score-theater-stage')).to.be(false);
                    score.dom.theater.Stage(node);
                    console.log(1, node.attr('class'));
                    expect(node.hasClass('score-theater-stage')).to.be(true);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('should provide a node member', function(done) {
            loadScore(['oop', 'dom', 'dom.theater'], function(score) {
                try {
                    var node = score.dom('#fixture .fixture-stage');
                    var stage = score.dom.theater.Stage(node);
                    expect(stage.node).to.be(node);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('should not change the node content', function(done) {
            loadScore(['oop', 'dom', 'dom.theater'], function(score) {
                try {
                    var node = score.dom('#fixture .fixture-stage');
                    var prevHTML = node[0].innerHTML;
                    score.dom.theater.Stage(node);
                    expect(node[0].innerHTML).to.be(prevHTML);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

    });

    describe('Scene constructor', function() {

        before(function() {
            var fixture = document.getElementById('fixture');
            fixture.innerHTML = 
                '<div class="ficture-stage"> <!-- the stage -->' +
                '    <div class="fixture-scene fixture-scene-1"> <!-- a scene -->' +
                '    </div>' +
                '    <div class="fixture-scene"> <!-- another scene -->' +
                '    </div>' +
                '</div>';
        });

        after(function() {
            var fixture = document.getElementById('fixture');
            while (fixture.children.length) {
                fixture.removeChild(fixture.children[0]);
            }
        });

        it('should set css classes', function(done) {
            loadScore(['oop', 'dom', 'dom.theater'], function(score) {
                try {
                    var stageNode = score.dom('#fixture .fixture-stage');
                    var scene1Node = score.dom('#fixture .fixture-scene').first;
                    var scene2Node = score.dom('#fixture .fixture-scene').eq(1);
                    expect(scene1Node.hasClass('score-theater-scene')).to.be(false);
                    expect(scene2Node.hasClass('score-theater-scene')).to.be(false);
                    var stage = score.dom.theater.Stage(stageNode);
                    expect(scene1Node.hasClass('score-theater-scene')).to.be(false);
                    expect(scene2Node.hasClass('score-theater-scene')).to.be(false);
                    score.dom.theater.Scene(stage, 'scene1', scene1Node);
                    expect(scene1Node.hasClass('score-theater-scene')).to.be(true);
                    expect(scene2Node.hasClass('score-theater-scene')).to.be(false);
                    score.dom.theater.Scene(stage, 'scene2', scene2Node);
                    expect(scene1Node.hasClass('score-theater-scene')).to.be(true);
                    expect(scene2Node.hasClass('score-theater-scene')).to.be(true);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('should provide a node member', function(done) {
            loadScore(['oop', 'dom', 'dom.theater'], function(score) {
                try {
                    var stageNode = score.dom('#fixture .fixture-stage');
                    var stage = score.dom.theater.Stage(stageNode);
                    var scene1Node = score.dom('#fixture .fixture-scene').first;
                    var scene2Node = score.dom('#fixture .fixture-scene').eq(1);
                    var scene1 = score.dom.theater.Scene(stage, 'scene1', scene1Node);
                    var scene2 = score.dom.theater.Scene(stage, 'scene2', scene2Node);
                    expect(scene1.node).to.be(scene1Node);
                    expect(scene2.node).to.be(scene2Node);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('should refuse duplicate scene names', function(done) {
            loadScore(['oop', 'dom', 'dom.theater'], function(score) {
                try {
                    var stageNode = score.dom('#fixture .fixture-stage');
                    var stage = score.dom.theater.Stage(stageNode);
                    var scene1Node = score.dom('#fixture .fixture-scene').first;
                    var scene2Node = score.dom('#fixture .fixture-scene').eq(1);
                    score.dom.theater.Scene(stage, 'SAMENAME', scene1Node);
                    expect(function() { score.dom.theater.Scene(stage, 'SAMENAME', scene2Node); }).to.throwError();
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('should not change the node content', function(done) {
            loadScore(['oop', 'dom', 'dom.theater'], function(score) {
                try {
                    var stageNode = score.dom('#fixture .fixture-stage');
                    var stage = score.dom.theater.Stage(stageNode);
                    var scene1Node = score.dom('#fixture .fixture-scene').first;
                    var prevHTML = scene1Node[0].innerHTML;
                    score.dom.theater.Scene(stage, 'scene1', scene1Node);
                    expect(scene1Node[0].innerHTML).to.be(prevHTML);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

    });

});

