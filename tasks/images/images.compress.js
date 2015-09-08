

/* ------------------------------------------------------------------------ */
/*
        tasks.images.compress
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var utils = require("./../../utils/utils.js");


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = function(paths){

    if(typeof paths === "string"){
        paths = [paths];
    }

    files = utils.files.expand(paths);
    files = utils.cache.filter(files, "images", "compress");

    return new Promise(function(resolve, reject){

        if(!files || files.length === 0){
            return resolve();
        }

        var Imagemin = require("imagemin");
        var humanize = require("humanize");
        var grunt = require("grunt");
        var glob = require("glob");
        var path = require("path");
        var fs = require("fs");

        var processCompressions = function(files, index){

            index = index || 0;

            if(files[index]){

                var stat1 = fs.statSync(files[index]);

                var next = function(){

                    var stat2 = fs.statSync(files[index]);

                    grunt.log.ok("{0} : File compressed : {1} {2} → {3}".format(
                        "images.compress".cyan,
                        utils.files.shorten(files[index]).grey,
                        humanize.filesize(stat1["size"]).green,
                        humanize.filesize(stat2["size"]).green
                    ));

                    if(files[index + 1]){

                        processCompressions(files, index + 1);

                    }else{

                        utils.cache.set(files, "images", "compress");

                        resolve();

                    }

                };

                var use = null;

                switch(path.extname(files[index]).toLowerCase()){

                    case ".jpeg" :
                    case ".jpg" :{

                        var jpegRecompress = require("imagemin-jpeg-recompress");

                        use = jpegRecompress({
                            loops : 3,
                            accurate : true,
                            method : "ms-ssim"
                        });

                        break;

                    }

                    case ".png" :{

                        use = Imagemin.optipng({ optimizationLevel : 3 });

                        break;

                    }

                    case ".gif" :{

                        use = Imagemin.gifsicle({ interlaced : true });

                        break;

                    }

                }

                if(use){

                    var imagemin = new Imagemin().src(files[index]).dest(path.dirname(files[index])).use(use);

                    imagemin.run(function(err, minifications){

                        if(err){
                            grunt.fail.fatal(err);
                        }

                        next();

                    });

                }else{

                    next();

                }

            }

        };

        processCompressions(files);

    });

}