

/* ------------------------------------------------------------------------ */
/*
        horde.task
*/
/* ------------------------------------------------------------------------ */


var should = require("chai").should();
var assert = require("assert");

var horde = require("../../../index");


/* ------------------------------------------------------------------------ */
/*
        tests
*/
/* ------------------------------------------------------------------------ */


describe("horde.task", function(){


    /* -------------------------------------------------------------------- */
    /*
            sub-modules
    */
    /* -------------------------------------------------------------------- */


    var functions = [
        "clean"
    ];

    var modules = [
        "bower",
        "bundle",
        "compile",
        "display",
        "gae",
        "lint",
        "minify",
        "modernizr",
        "open",
        "prompt",
        "replace",
        "settings",
        "watch"
    ];

    functions.forEach(function(func){

        it("Should have function: {0}".format(func), function(){

            assert.equal(typeof(describe), typeof(horde.task[func]));

        });

    });

    modules.forEach(function(module){

        it("Should have sub-module: {0}".format(module), function(){

            assert.equal(typeof({}), typeof(horde.task[module]));

        });

    });


});
