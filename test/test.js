if (typeof loadScore === 'undefined') {

    var loadScore = function loadScore(modules, callback) {
        var fs = require('fs'),
            request = require('sync-request'),
            vm = require('vm');
        if (typeof modules === 'function') {
            callback = modules;
            modules = [];
        } else if (!modules) {
            modules = [];
        }
        var loaded = {};
        var customRequire = function(module) {
            if (loaded[module]) {
                return loaded[module];
            }
            var script, url, name = module.substring('score.'.length);
            if (testConf[name] === 'local') {
                script = fs.readFileSync(__dirname + '/../' + name.replace('.', '/') + '.js', {encoding: 'UTF-8'});
            } else if (testConf[name]) {
                url = 'https://raw.githubusercontent.com/score-framework/js.' + name + '/' + testConf[name] + '/' + name + '.js';
            } else {
                url = 'https://raw.githubusercontent.com/score-framework/js.' + name + '/master/' + name + '.js';
            }
            if (url) {
                if (!loadScore.cache[url]) {
                    loadScore.cache[url] = request('GET', url).getBody('utf8');
                }
                script = loadScore.cache[url];
            }
            var sandbox = vm.createContext({require: customRequire, module: {exports: {}}});
            vm.runInContext(script, sandbox, module + '.js');
            loaded[module] = sandbox.module.exports;
            return loaded[module];
        };
        var score = customRequire('score.init');
        for (var i = 0; i < modules.length; i++) {
            customRequire('score.' + modules[i]);
        }
        callback(score);
    };

    loadScore.cache = {};

    var expect = require('expect.js');
}

var testConf = {
    'dom.theater': 'local'
};

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

