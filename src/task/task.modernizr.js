

/* ------------------------------------------------------------------------ */
/*
        horde.task.modernizr
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var util = require("./../util/util.js");


/* ------------------------------------------------------------------------ */
/*
        private
*/
/* ------------------------------------------------------------------------ */


var processPaths = function(paths, destination){

    var path = require("path");
    var fs = require("fs");
    var excludes = [];

    paths = util.file.expand(paths);

    paths.forEach(function(p, i){

        var isDir = fs.lstatSync(p).isDirectory();

        paths[i] = isDir ? path.join(paths[i], "modernizr.json") : paths[i];

        var ex = path.join(path.dirname(paths[i]), destination);

        excludes.push("!{0}/**/modernizr.json".format(ex));

    });

    return paths.concat(excludes);

};


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {


    /* -------------------------------------------------------------------- */
    /*
            functions
    */
    /* -------------------------------------------------------------------- */


    install : function(paths, destination){

        paths = processPaths(paths, destination);

        files = util.file.expand(paths);
        files = util.cache.filter(files, "modernizr", "json");

        return new Promise(function(resolve, reject){

            if(!files || !files.length){
                return resolve();
            }

            var modernizr = require("modernizr");
            var grunt = require("grunt");
            var bower = require("bower");
            var path = require("path");

            var log = function(result){
                util.log.writeln(["modernizr", result.id.cyan, result.message].join(" "));
            };

            var error = function(error){

                reject(error);

                grunt.fail.fatal(error);

            };

            var process = function(files, index){

                index = index || 0;

                if(files[index]){

                    var next = function(){

                        if(files[index + 1]){

                            process(files, index + 1);

                        }else{

                            util.cache.set(files, "modernizr", "json");

                            resolve(files);

                        }

                    };

                    util.log.ok("{0} : install : {1}".format(
                        "modernizr.json".cyan,
                        util.path.shorten(files[index]).grey
                    ));

                    var config = grunt.file.readJSON(files[index]);

                    modernizr.build(config, function(result){

                        var output = path.join(destination, "modernizr.js");
                        var uglify = require("uglify-js");

                        util.log.ok("{0} : write : {1}".format(
                            "modernizr.json".cyan,
                            util.path.shorten(output).grey
                        ));

                        grunt.file.write(output, uglify.minify(result).code);

                        next();

                    });

                }

            };

            process(files);

        });

    }

};
