

/* ------------------------------------------------------------------------ */
/*
        horde.task.bower
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

        paths[i] = isDir ? path.join(paths[i], "bower.json") : paths[i];

        var ex = path.join(path.dirname(paths[i]), destination);

        excludes.push("!{0}/**/bower.json".format(ex));

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


    install : function(targets){

        return new Promise(function(resolve, reject){

            var nextBower = function(indexBower){

                indexBower = indexBower || 0;

                if(indexBower >= targets.length){

                    resolve();

                }else{

                    var paths = targets[indexBower].file;
                    var destination = targets[indexBower].dest;

                    paths = processPaths(paths, destination);

                    files = util.file.expand(paths);
                    files = util.cache.filter(files, "bower", "json");

                    if(!files || !files.length){
                        return nextBower(indexBower + 1);
                    }

                    var grunt = require("grunt");
                    var bower = require("bower");
                    var path = require("path");

                    var log = function(result){
                        util.log.writeln(["bower.json", result.id.cyan, result.message].join(" "));
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

                                    util.cache.set(files, "bower", "json");

                                    nextBower(indexBower + 1);

                                }

                            };

                            util.log.ok("{0} : install : {1}".format(
                                "bower.json".cyan,
                                util.path.shorten(files[index]).grey
                            ));

                            bower.commands.install(
                                [],
                                {
                                    save : true
                                },
                                {
                                    cwd : path.dirname(files[index]),
                                    directory : destination
                                }
                            )
                            .on("log", log)
                            .on("error", error)
                            .on("end", next);

                        }

                    };

                    process(files);

                }

            };

            nextBower();

        });

    }

};
