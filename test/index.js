
var should = require('chai').should();
var horde = require('../index');
var wtf = horde.wtf;

describe('#test', function() {

    it('prints wtf:{param}', function() {
        wtf('wtf').should.equal('wtf:wtf');
    });

});

