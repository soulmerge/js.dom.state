if (typeof loadScore == 'undefined') {
    var tmp = require('./node.js');
    loadScore = tmp.loadScore;
    expect = tmp.expect;
}

describe('score.dom', function() {

    describe('module', function() {

        it('should add the score.dom.theater object', function(done) {
            loadScore(['oop', 'dom'], function(score) {
                expect(score).to.be.an('object');
                expect(score.dom).to.be.a('function');
                expect(score.dom.theater).to.be(undefined);
                loadScore(['oop', 'dom', 'dom.theater'], function(score) {
                    expect(score).to.be.an('object');
                    expect(score.dom).to.be.a('function');
                    expect(score.dom.theater).to.be.an('object');
                    done();
                });
            });
        });

        it('should provide the "Stage" and "Scene" classes', function(done) {
            loadScore(['oop', 'dom', 'dom.theater'], function(score) {
                expect(score.dom.theater.Stage).to.be.a('function');
                expect(score.dom.theater.Scene).to.be.a('function');
                done();
            });
        });

    });

});

