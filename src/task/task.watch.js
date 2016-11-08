

/* ------------------------------------------------------------------------ */
/*
        horde.task.watch
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var util = require("./../util/util.js");
var compile = require("./compile/compile.js");
var minify = require("./minify/minify.js");
var bundle = require("./bundle/bundle.js");
var lint = require("./lint/lint.js");
var process = require("./task.process.js");
var build = require("./build/build.js");


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


    folders : function(config, useBuild){

        config = JSON.parse(JSON.stringify(config));
        config.options = config.options || {};

        var chokidar = require("chokidar");
        var extend = require("deep-extend");
        var path = require("path");

        var folders = config.folders;

        var ignored = function(folder){

            var ignored = folder.ignore || [];

            if(typeof ignored === "string"){
                ignored = [ignored];
            }

            ignored.forEach(function(item, index){
                ignored[index] = item + "/**";
            });

            ignored = ignored.concat([
                "**/.cache/**",
                "**/.*"
            ]);

            return ignored;

        };

        var start = function(folder){

            var allResets = [];
            var watcher;

            config.resets = config.resets || [];

            for(var reset in config.resets){
                allResets = allResets.concat(config.resets[reset]);
            }

            var doBuild = function(file, add){

                if(!add && allResets.indexOf(file) > -1){

                    for(var res in config.resets){

                        if(config.resets[res].indexOf(file) > -1){

                            util.log.ok("{0} : {1}".format(
                                "watch.reset".cyan,
                                reset.grey
                            ));

                            util.cache.clear(res);

                        }

                    }

                    watcher.close();

                    watcher = null;

                    start(folder);

                }else{

                    var targ = process;

                    if(useBuild){
                        targ = build;
                    }

                    targ.file({
                        ext : path.extname(file).replace(/\./g, "").toLowerCase(),
                        options : folder.options,
                        folders : config.folders,
                        source : config.source,
                        build : config.build,
                        dest : folder.dest,
                        cwd : folder.cwd,
                        folder : folder,
                        path : file
                    }).then(undefined, function(e){

                        util.log.error(e);

                        util.execSync("tput bel");

                    });

                }

            };

            watcher = chokidar.watch(folder.cwd, {
                ignored : ignored(folder),
                ignoreInitial : false,
                persistent : true
            });

            watcher.on("add", function(file){

                doBuild(file, true);

            }).on("change", function(file){

                doBuild(file);

            });

        };

        for(var index in folders){

            var folder = JSON.parse(JSON.stringify(folders[index]));

            if(typeof folder === "string"){

                folder = {
                    dest : folder
                };

            }

            folder.cwd = index;
            folder.options = JSON.parse(JSON.stringify(extend(config.options, folder.options)));

            start(folder);

        }

    }


};
