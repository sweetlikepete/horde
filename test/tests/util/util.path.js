

/* ------------------------------------------------------------------------ */
/*
        horde.util.path
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


describe("horde.util.path", function(){


    /* -------------------------------------------------------------------- */
    /*
            functions
    */
    /* -------------------------------------------------------------------- */


    describe("#shorten()", function(){

        it("Should remove the current working directory from a path string", function(){

            var shortened = horde.util.path.shorten(__filename);

            assert.equal(__filename.indexOf(process.cwd()), 0);
            assert.equal(shortened.indexOf(process.cwd()), -1);

        });

        it("Should only ever return a string", function(){

            assert.equal(typeof(horde.util.path.shorten(1)), "string");
            assert.equal(typeof(horde.util.path.shorten([])), "string");
            assert.equal(typeof(horde.util.path.shorten()), "string");
            assert.equal(typeof(horde.util.path.shorten(null)), "string");
            assert.equal(typeof(horde.util.path.shorten(undefined)), "string");
            assert.equal(typeof(horde.util.path.shorten("")), "string");
            assert.equal(typeof(horde.util.path.shorten({})), "string");

        });

    });


});