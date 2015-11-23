

/* ------------------------------------------------------------------------ */
/*
        horde.util
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


describe("horde.util", function(){


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
        "log",
        "path",
        "process",
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


    var shortcuts = [
        "config",
        "extend"
    ];

    shortcuts.forEach(function(shortcut){

        it("Should have function shortcut: {0}".format(shortcut), function(){

            assert.equal("function", typeof(horde.util[shortcut]));

        });

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