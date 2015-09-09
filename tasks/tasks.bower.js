

/* ------------------------------------------------------------------------ */
/*
        tasks.bower
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var utils = require("./../utils/utils.js");


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {

    install : function(paths, destination){

        files = utils.files.expand(paths, "bower.json");
        files = utils.cache.filter(files, "bower", "install");

        return new Promise(function(resolve, reject){

            if(!files || files.length === 0){
                return resolve();
            }

            var grunt = require("grunt");
            var bower = require("bower");
            var path = require("path");

            var log = function(result){
                grunt.log.writeln(["bower", result.id.cyan, result.message].join(" "));
            };

            var error = function(error){
                grunt.fail.fatal(error);
            };

            var process = function(files, index){

                index = index || 0;

                if(files[index]){

                    var next = function(){

                        if(files[index + 1]){

                            process(files, index + 1);

                        }else{

                            utils.cache.set(files, "bower", "install");

                            resolve();

                        }

                    };

                    grunt.log.ok("{0} : Running : {1}".format(
                        "bower.install".cyan,
                        utils.files.shorten(files[index]).grey
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

}