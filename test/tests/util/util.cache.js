

/* ------------------------------------------------------------------------ */
/*
        horde.util.cache
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


describe("horde.util.cache", function(){


    /* -------------------------------------------------------------------- */
    /*
            functions
    */
    /* -------------------------------------------------------------------- */


    describe("#hashFile()", function(){

        var expansions = [];

        it("Should return null if it does not find a file to hash", function(){

            assert.equal(horde.util.cache.hashFile("definitely-not-a-real-file.txt"), null);
            assert.equal(horde.util.cache.hashFile(null), null);
            assert.equal(horde.util.cache.hashFile(1), null);
            assert.equal(horde.util.cache.hashFile(), null);

        });

        it("Should generate the same hash for identical files", function(){

            assert.equal(
                horde.util.cache.hashFile("test/resources/util/cache/hashFile/equal-1.txt"),
                horde.util.cache.hashFile("test/resources/util/cache/hashFile/equal-2.txt")
            );

        });

        it("Should generate different hashes for different files", function(){

            assert.notEqual(
                horde.util.cache.hashFile("test/resources/util/cache/hashFile/unequal-1.txt"),
                horde.util.cache.hashFile("test/resources/util/cache/hashFile/unequal-2.txt")
            );

        });

    });

    describe("#clean()", function(){

        it("Should clean out the cache with the exception of 'prompt'.", function(){

            horde.util.cache.clean();

            horde.util.cache.set("", "prompt", "");

            var cache = horde.util.cache.getAll();

            assert(cache.prompt);

            delete cache.prompt;

            assert.deepEqual(cache, {});

        });

    });

});