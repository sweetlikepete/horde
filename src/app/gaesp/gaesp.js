

/* ------------------------------------------------------------------------ */
/*
        horde.app.gae-sp
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = function(grunt, horde, config){

    var extend = horde.util.extend;
    var path = require("path");

    var defaults = {
        source : "src",
        logo : path.join(__dirname, "gaesp.logo.png"),
        fail : path.join(__dirname, "gaesp.fail.png"),
        build : "<% source %>/build",
        clean : [
            "<% source %>/**/*.pyc",
            "<% build %>"
        ],
        bower : {
            file : "<% source %>/bower.json",
            dest : "static/lib/bower"
        },
        modernizr : {
            file : "<% source %>/modernizr.json",
            dest : "<% source %>/static/lib/modernizr"
        },
        production : {
            url : "http://www.appengine.com"
        },
        local : {
            url : "http://localhost",
            port : 58008
        },
        process : {
            build : "<% build %>",
            source : "<% source %>",
            options : {
                all : {
                    scss : {
                        includePaths : ["<% source %>"]
                    },
                    html : {
                        antiCache : [
                            {
                                path : "/app/",
                                rel : "<% source %>"
                            },
                            {
                                path : "/static/",
                                rel : "<% source %>"
                            }
                        ]
                    }
                }
            },
            folders : {
                "<% source %>/app" : {
                    dest : "app"
                }
            }
        }
    };

    config = horde.util.config(extend(defaults, config));


    /* -------------------------------------------------------------------- */
    /*
            Promises
    */
    /* -------------------------------------------------------------------- */


    var build = function(){

        return new Promise(function(resolve, reject){

            horde.util.promise()
            .then(function(){

                var bower = config.bower instanceof Array ? config.bower : [config.bower];

                return horde.task.bower.install(bower);

            })
            .then(function(){

                return horde.task.modernizr.install(config.modernizr.file, config.modernizr.dest);

            })
            .then(function(){

                return horde.task.build.folders(config.process);

            })
            .then(function(){

                return horde.task.sw.generate(config.sw);

            })
            .then(resolve, function(errors){

                horde.util.log.error(errors);

                return fail("Build Failed");

            })
            .catch(horde.util.log.error);

        });

    };

    var clean = function(){

        return new Promise(function(resolve, reject){

            if(grunt.option('dirty')){

                resolve();

            }else{

                horde.util.promise()
                .then(function(){

                    return horde.util.cache.clean();

                })
                .then(function(){

                    return horde.task.clean(config.clean);

                })
                .catch(horde.util.log.error)
                .then(resolve);

            }

        });

    };

    var complete = function(message){

        return new Promise(function(resolve, reject){

            horde.util.promise()
            .then(function(){

                return horde.task.display.image(config.logo, 25);

            })
            .then(function(){

                return horde.task.display.complete(message || "Complete");

            })
            .catch(horde.util.log.error)
            .then(resolve);

        });

    };

    var fail = function(message){

        return new Promise(function(resolve, reject){

            horde.util.promise()
            .then(function(){

                return horde.task.display.image(config.fail, 25);

            })
            .then(function(){

                return horde.task.display.failed(message || "Fail!");

            })
            .catch(horde.util.log.error)
            .then(resolve);

        });

    };



    /* -------------------------------------------------------------------- */
    /*
            Tasks
    */
    /* -------------------------------------------------------------------- */


    grunt.registerTask("build", "Build the project", function(){

        horde.util.promise()
        .then(build)
        .then(function(){

            return complete("Build complete");

        })
        .catch(horde.util.log.error)
        .then(this.async());

    });

    grunt.registerTask("clean", "Clean horde cache and build directories", function(){

        horde.util.promise()
        .then(clean)
        .then(function(){

            return complete("Clean complete");

        })
        .catch(horde.util.log.error)
        .then(this.async());

    });

    grunt.registerTask("update", "Update the GAE components of the application", function(){

        horde.util.promise()
        .then(function(){

            return horde.task.gae.update();

        })
        .then(function(){

            return complete("Update complete");

        })
        .catch(horde.util.log.error)
        .then(this.async());

    });

    grunt.registerTask("deploy", "Deploy the application", function(){

        horde.util.promise()
        .then(clean)
        .then(build)
        .then(function(){

            return horde.task.gae.deploy({ path : config.source });

        })
        .then(function(){

            return complete("Deploy complete");

        })
        .then(function(){

            horde.task.open.url("{0}".format(config.production.url), true);

        })
        .catch(horde.util.log.error)
        .then(this.async());

    });

    grunt.registerTask("sync", "Sync the local development server with production data.", function(){

        var done = this.async();

        horde.util.promise()
        .then(function(){

            horde.task.gae.sync({
                local : config.local.url + ":" + (config.local.port + 2),
                production : config.production.url,
                models : config.sync,
                id : config.id
            });

        })
        .catch(horde.util.log.error);

    });

    grunt.registerTask("local", "Start the local development server.", function(){

        var done = this.async();

        var clear = grunt.option("clear") || false;

        horde.util.promise()
        .then(build)
        .then(function(){

            horde.task.open.url("{0}:{1}".format(config.local.url, config.local.port), true);
            horde.task.watch.folders(config.process, true);
            horde.task.gae.start({
                path : config.source,
                port : config.local.port,
                clear : clear
            });

        })
        .catch(horde.util.log.error);

    });

    grunt.registerTask("rollback", "Rolback the current deploy.", function(){

        var done = this.async();

        horde.util.promise()
        .then(function(){

            return horde.task.gae.rollback({ path : config.source });

        })
        .catch(horde.util.log.error);

    });


    /* -------------------------------------------------------------------- */
    /*
            Default Task
    */
    /* -------------------------------------------------------------------- */


    grunt.registerTask("default", ["local"]);


};
