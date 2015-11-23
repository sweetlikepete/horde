

/* ------------------------------------------------------------------------ */
/*
        horde
*/
/* ------------------------------------------------------------------------ */


var should = require("chai").should();
var assert = require("assert");

var horde = require("../../index");


/* ------------------------------------------------------------------------ */
/*
        tests
*/
/* ------------------------------------------------------------------------ */


describe("horde", function(){


    /* -------------------------------------------------------------------- */
    /*
            sub-modules
    */
    /* -------------------------------------------------------------------- */


    it("Should have sub-module: task", function(){

        assert.equal(typeof({}), typeof(horde.task));

    });

    it("Should have sub-module: util", function(){

        assert.equal(typeof({}), typeof(horde.util));

    });


});