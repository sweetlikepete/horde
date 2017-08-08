

/* ------------------------------------------------------------------------ */
/*
        horde.task.minify.image
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


var config = {
    cache : ".cache/task.minify.image",
    task : "minify",
    ext : "image"
};

var cachePath = function(file){

    var path = require("path");

    return path.join(path.dirname(file.path), config.cache, path.basename(file.path));

};

var cached = function(file){

    var fs = require("fs");

    var cache = cachePath(file);

    if(fs.existsSync(cache) && util.cache.hashFile(file.path) === util.cache.hashFile(cache)){
        return true;
    }

    return false;

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


    file : function(file, options){

        var imageminOptipng = require("imagemin-optipng");
        var imageminGifsicle = require("imagemin-gifsicle");
        var Imagemin = require("imagemin");
        var humanize = require("humanize");
        var fse = require("fs-extra");
        var grunt = require("grunt");
        var path = require("path");
        var fs = require("fs");

        return new Promise(function(resolve, reject){

            if(cached(file)){

                resolve();

            }else{

                util.log.ok("{0} : read : {1}".format(
                    "{0}.{1}".format(config.ext, config.task).cyan,
                    util.path.shorten(file.path).grey
                ));

                var stat1 = fs.statSync(file.path);

                var use = null;

                switch(file.ext){

                    case "jpeg" :
                    case "jpg" :{

                        var jpegRecompress = require("imagemin-jpeg-recompress");

                        use = jpegRecompress({
                            loops : 3,
                            accurate : true,
                            method : "ms-ssim"
                        });

                        break;

                    }

                    case "png" :{

                        use = imageminOptipng({ optimizationLevel : 3 });

                        break;

                    }

                    case "gif" :{

                        use = imageminGifsicle({ interlaced : true });

                        break;

                    }

                }

                if(use){

                    // .src(file.path).dest(path.dirname(file.path)).use(use);

                    Imagemin([file.path], path.dirname(file.path), {
                        plugins : [use]
                    }).then((files) => {

                        var stat2 = fs.statSync(file.path);

                        fse.copySync(file.path, cachePath(file));

                        util.log.ok("{0} : write : {1} {2} → {3}".format(
                            "{0}.{1}".format(config.ext, config.task).cyan,
                            util.path.shorten(file.path).grey,
                            humanize.filesize(stat1["size"]).green,
                            humanize.filesize(stat2["size"]).green
                        ));

                        resolve();

                    }, (err) => {

                        reject("{0} - {1}".format(err, file.path));

                    });

                    /* imagemin.run(function(err, minifications){

                        if(err){

                            reject("{0} - {1}".format(err, file.path));

                        }else{

                            var stat2 = fs.statSync(file.path);

                            fse.copySync(file.path, cachePath(file));

                            util.log.ok("{0} : write : {1} {2} → {3}".format(
                                "{0}.{1}".format(config.ext, config.task).cyan,
                                util.path.shorten(file.path).grey,
                                humanize.filesize(stat1["size"]).green,
                                humanize.filesize(stat2["size"]).green
                            ));

                            resolve();

                        }

                    }); */

                }else{

                    resolve();

                }

            }

        });

    }


};
