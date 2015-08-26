
var should = require('chai').should();
var horde = require('../index');

describe('#tasks.bower', function() {

    horde.tasks.bower.install({
        "/Users/peter/code/f8/primedia_group/**/bower.json" : "static/lib/bower"
    });

});

