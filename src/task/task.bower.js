

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


    install : function(paths, destination){

        paths = processPaths(paths, destination);

        files = util.file.expand(paths);
        files = util.cache.filter(files, "bower.json", "install");

        return new Promise(function(resolve, reject){

            if(!files || !files.length){
                return resolve([]);
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

                            util.cache.set(files, "bower.json", "install");

                            resolve(files);

                        }

                    };

                    util.log.ok("{0} : Running : {1}".format(
                        "bower.json.install".cyan,
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

        });

    }

};
