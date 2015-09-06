
var should = require('chai').should();
var horde = require('../index');

describe('#tasks.bower', function() {

    console.log("WTF");

    horde.tasks.bower.install({
        "/Users/sweetlikepete/code/f8/primedia_group/src/web/modules/{frontend,backend}/bower.json" : "static/lib/bower"
    }).then(function(result){

        console.log("result");

    });

});

