

/* ------------------------------------------------------------------------ */
/*
        horde.task.minify
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


describe("horde.task.minify", function(){


    /* -------------------------------------------------------------------- */
    /*
            prototypes
    */
    /* -------------------------------------------------------------------- */


    it("Should have prototype: String.format", function(){

        assert.equal("function", typeof("".format));

    });


    /* -------------------------------------------------------------------- */
    /*
            sub-modules
    */
    /* -------------------------------------------------------------------- */


    var modules = [
        "cache",
        "file",
        "path",
        "validate"
    ];

    modules.forEach(function(module){

        it("Should have sub-module: {0}".format(module), function(){

            assert.equal(typeof({}), typeof(horde.util[module]));

        });

    });


    /* -------------------------------------------------------------------- */
    /*
            function shortcuts
    */
    /* -------------------------------------------------------------------- */


    it("Should have function shortcut: extend", function(){

        assert.equal("function", typeof(horde.util.extend));

    });


    /* -------------------------------------------------------------------- */
    /*
            functions
    */
    /* -------------------------------------------------------------------- */


    describe("#promise()", function(){

        it("Should return a blank promise", function(){

            assert.equal("Promise", horde.util.promise().constructor.name);

        });

    });


});