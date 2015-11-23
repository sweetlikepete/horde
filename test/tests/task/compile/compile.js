

/* ------------------------------------------------------------------------ */
/*
        horde.task.compile
*/
/* ------------------------------------------------------------------------ */


var should = require("chai").should();
var assert = require("assert");

var horde = require("../../../../index");


/* ------------------------------------------------------------------------ */
/*
        tests
*/
/* ------------------------------------------------------------------------ */


describe("horde.task.compile", function(){


    /* -------------------------------------------------------------------- */
    /*
            sub-modules
    */
    /* -------------------------------------------------------------------- */


    var functions = [
        "file"
    ];

    var modules = [
        "coffee",
        "less",
        "scss"
    ];

    functions.forEach(function(func){

        it("Should have function: {0}".format(func), function(){

            assert.equal(typeof(describe), typeof(horde.task.compile[func]));

        });

    });

    modules.forEach(function(module){

        it("Should have sub-module: exts.{0}".format(module), function(){

            assert.equal(typeof({}), typeof(horde.task.compile.exts[module]));

        });

    });


});