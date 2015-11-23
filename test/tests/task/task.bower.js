

/* ------------------------------------------------------------------------ */
/*
        horde.task.bower
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


describe("horde.task.bower", function(){

    describe("#install()", function(){

        var rimraf = require("rimraf");
        var grunt = require("grunt");
        var path = require("path");
        var fs = require("fs");

        var search = "test/resources/task/bower";
        var destination = "bower_install";
        var install = path.resolve(path.join(search, destination));
        var installs = {};

        this.timeout(10000);

        before(function(before_done){

            horde.util.cache.clean();

            horde.task.bower.install(search, destination).then(function(first_files){

                installs.jquery_first = first_files;

                horde.task.bower.install(search, destination).then(function(second_files){

                    installs.jquery_second = second_files;

                    search = "test/resources/task/bower/*/bower.json";
                    destination = "bower_install";

                    horde.task.bower.install(search, destination).then(function(multiple_files){

                        installs.multiple = multiple_files;

                        before_done();

                    });

                });

            });

        });

        it("Should find and install a single bower.json file", function(){

            assert(installs.jquery_first.length === 1);

        });

        it("Should cache installs it has already completed", function(){

            assert(installs.jquery_second.length === 0);

        });

        it("Should install a package into the correct location", function(){

            assert(fs.existsSync(path.join(install, "jquery")));

            grunt.file.delete(install);

        });

        it("Should install multiple bower.json files", function(){

            assert(installs.multiple.length === 2);

        });

    });

});