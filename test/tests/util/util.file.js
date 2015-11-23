

/* ------------------------------------------------------------------------ */
/*
        horde.util.file
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


describe("horde.util.file", function(){


    /* -------------------------------------------------------------------- */
    /*
            functions
    */
    /* -------------------------------------------------------------------- */


    describe("#expand()", function(){

        var expansions = [];

        it("Should find and return paths", function(){

            expansions.push(horde.util.file.expand(["src/{task,util}/**/*.js", "! src/util/**"]));
            expansions.push(horde.util.file.expand(["src/{task,util}", "! src/util/**"], "js"));
            expansions.push(horde.util.file.expand(["src/{task,util}/", "! src/util/**"], "js"));
            expansions.push(horde.util.file.expand("src/task/**/*.js"));
            expansions.push(horde.util.file.expand("src/task", "js"));
            expansions.push(horde.util.file.expand("src/task/", "js"));
            expansions.push(horde.util.file.expand("src/task/", ".js"));

            assert(expansions[0].length > 0);

        });

        it("Should ignore paths correctly", function(){

            var files = horde.util.file.expand([
                "test/resources/util/file/expand/ignore/a/**",
                "! test/resources/util/file/expand/ignore/a/**/b"
            ], ".js");

            assert(files.length === 1);

        });

        it("Should return paths consistently", function(){

            for(var i = 0; i < expansions.length - 1; i++){
                assert.deepEqual(expansions[i], expansions[i + 1]);
            }

        });

        it("Should filter by extension", function(){

            var files = horde.util.file.expand("test/resources/util/file/expand/extension/test.js", "less");

            assert(files.length === 0);

        });

        var wildcards = [];

        it("Should find and return wildcard extension paths", function(){

            wildcards.push(horde.util.file.expand("test/resources/util/file/expand/wildcard", "*"));
            wildcards.push(horde.util.file.expand("test/resources/util/file/expand/wildcard", "*s"));
            wildcards.push(horde.util.file.expand("test/resources/util/file/expand/wildcard/**/*.*", "*"));
            wildcards.push(horde.util.file.expand("test/resources/util/file/expand/wildcard/**/*.*", "*s"));

            assert(wildcards[0].length === 9);

        });

        it("Should return wildcard extension paths consistently", function(){

            for(var i = 0; i < wildcards.length - 1; i++){
                assert.deepEqual(wildcards[i], wildcards[i + 1]);
            }

        });

    });


});