

/* ------------------------------------------------------------------------ */
/*
        horde.task.scan
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var util = require("./../../util/util.js");


/* ------------------------------------------------------------------------ */
/*
        private
*/
/* ------------------------------------------------------------------------ */


var defaults = {
    builders : [
        "scss",
        "js",
        "es",
        "html",
        "png",
        "jpg",
        "jpeg",
        "gif",
        "ogg",
        "webm",
        "mp4",
        "json",
        "psd"
    ]
};

var builders = {
    scss : require("./ext/scss/scss.js"),
    js : require("./ext/js/js.js"),
    es : require("./ext/es/es.js"),
    html : require("./ext/html/html.js"),
    png : require("./ext/image/image.js"),
    jpg : require("./ext/image/image.js"),
    jpeg : require("./ext/image/image.js"),
    gif : require("./ext/image/image.js"),
    ogg : require("./ext/video/video.js"),
    webm : require("./ext/video/video.js"),
    mp4 : require("./ext/video/video.js"),
    json : require("./ext/json/json.js"),
    psd : require("./ext/psd/psd.js")
};


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {


    /* ------------------------------------------------------------------- */
    /*
            methods
    */
    /* ------------------------------------------------------------------- */

    file : function(file, builds){

        return new Promise(function(resolve, reject){

            builds = builds || defaults.builders;

            if(typeof(builds) === "string"){
                builds = [builds];
            }

            if(!builders[file.ext]){

                resolve();

            }else{

                util.promise()
                .then(function(){

                    var opts = util.extend(file.options.all, file.options[file.ext]);

                    return builders[file.ext].build(file, opts);

                })
                .then(
                    function(){

                        resolve();

                    },
                    function(err){

                        reject(err);

                    }
                )
                .catch(util.log.error);

            }

        });

    },

    folders : function(config, builds){

        var self = this;

        builds = builds || defaults.builders;

        if(typeof(builds) === "string"){
            builds = [builds];
        }

        var files = util.process.expand(config);
        var calls = [];

        builds.forEach(function(extension){

            files.forEach(function(file){

                if(file.ext == extension && builders[extension]){
                    calls.push(file);
                }

            });

        });

        return new Promise(function(resolve, reject){

            var errors = [];

            var next = function(index){

                index = index || 0;

                if(index !== calls.length){

                    var ext = calls[index].ext;

                    if(builders[ext]){

                        var file = calls[index];
                        var opts = util.extend(file.options.all, file.options[file.ext]);

                        builders[ext].build(file, opts).then(function(){

                            next(index += 1);

                        }, function(errs){

                            errors = errors.concat(errs);

                            next(index += 1);

                        });

                    }else{

                        next(index += 1);

                    }

                }else{

                    if(!errors.length){

                        resolve();

                    }else{

                        reject(errors);

                    }

                }

            };

            next();

        });

    }


};
