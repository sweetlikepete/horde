

/* ------------------------------------------------------------------------ */
/*
        tasks.images.responsive
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var utils = require("./../../utils/utils.js");
var compress = require("./images.compress.js");


/* ------------------------------------------------------------------------ */
/*
        config
*/
/* ------------------------------------------------------------------------ */


var config = {
    "multiples" : [1, 2, 4]
};


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = function(paths, options){

    options = utils.extend(config, options);

    files = utils.files.expand(paths, "*@*x.{jpg,jpeg,png}.psd");

    return new Promise(function(resolve, reject){

        if(!files || files.length === 0){
            return resolve();
        }

        var humanize = require("humanize");
        var sizeOf = require("image-size");
        var grunt = require("grunt");
        var path = require("path");
        var PSD = require("psd");
        var fs = require("fs");
        var gm = require("gm");

        var compileMatches = function(files, callback){

            var targets = [];

            var sizesFilter = function(value){
                return value <= this;
            };

            files.forEach(function(file){

                var re = /(.*?)@(\d)x.(.*).psd/i;
                var format = file.replace(re, "$3");
                var size = Number(file.replace(re, "$2"));
                var sizes = options.multiples.filter(sizesFilter, size);

                format = format === "jpg" ? "jpeg" : format;

                targets.push({
                    target : file,
                    format : format,
                    size : size,
                    sizes : sizes
                });

            });

            var processMatches = function(matches, index){

                index = index || 0;

                if(!matches.length){
                    return callback(matches);
                }

                if(matches[index]){

                    var next = function(){

                        if(matches[index + 1]){
                            processMatches(matches, index + 1);
                        }else{
                            callback(matches);
                        }

                    };

                    var target = matches[index].target;
                    var dir = path.dirname(target);
                    var name = path.basename(target);
                    var previous = path.join(dir, "resized/.info", name);
                    var dest = path.join(dir, "resized/.info/", name.replace(/.psd$/, ""));

                    if(
                        fs.existsSync(previous) &&
                        utils.cache.hashFile(previous) === utils.cache.hashFile(target)
                    ){
                        return next();
                    }

                    grunt.file.mkdir(path.dirname(dest));

                    PSD.open(target).then(function(psd){

                        return psd.image.saveAsPng(dest);

                    }).then(function(){

                        grunt.file.copy(target, previous);

                        next();

                    });

                }

            };

            processMatches(targets);

        };

        var cutResponsiveImages = function(matches, callback){

            var imageCuts = [];
            var outputs = [];

            matches.forEach(function(match){

                var target = match.target;
                var name = path.basename(target);
                var size = match.size;
                var dir = path.dirname(target);
                var sizes = match.sizes;
                var input = path.join(dir, "resized/.info/", name.replace(/.psd$/, ""));
                var previous = path.join(dir, "resized/.info/previous/", name.replace(/.psd$/, ""));
                var inputSize = sizeOf(input);

                for(var j = 0; j < sizes.length; j++){

                    var dest = input.replace("/.info/", "/").replace(/(.*?)@\d*\.?\dx(.*)/i, "$1@" + String(sizes[j]) + "x$2");
                    var base = input.replace("/.info/", "/").replace(/(.*?)@\d*\.?\dx(.*)/i, "$1$2");

                    dest = sizes[j] === 1 ? base : dest;

                    if(
                        !fs.existsSync(dest) ||
                        !fs.existsSync(previous) ||
                        utils.cache.hashFile(input) !== utils.cache.hashFile(previous)
                    ){

                        imageCuts.push({
                            previous : {
                                path : previous
                            },
                            output : {
                                path : dest,
                                width : Math.ceil(inputSize.width * (sizes[j] / size)),
                                height : Math.ceil(inputSize.height * (sizes[j] / size))
                            },
                            input : {
                                path : input
                            }
                        });

                    }

                }

            });

            var cutImages = function(cuts, index){

                index = index || 0;

                if(cuts[index]){

                    var next = function(error){

                        if(error){
                            grunt.fail.fatal(error);
                        }

                        var stat = fs.statSync(cuts[index].output.path);

                        grunt.log.ok("{0} : File cut: {1} → {2}".format(
                            "images.responsive".cyan,
                            utils.files.shorten(cuts[index].output.path).grey,
                            humanize.filesize(stat["size"]).green
                        ));

                        outputs.push(cuts[index].output.path);

                        if(cuts[index + 1]){

                            cutImages(cuts, index + 1);

                        }else{

                            grunt.file.copy(cuts[index].input.path, cuts[index].previous.path);

                            callback(outputs);

                        }

                    };

                    gm(cuts[index].input.path).thumb(
                        cuts[index].output.width,
                        cuts[index].output.height,
                        cuts[index].output.path,
                        100,
                        next
                    );

                }

            };

            if(!imageCuts.length){
                return callback();
            }

            cutImages(imageCuts);

        };

        grunt.log.ok("{0} : {1} found".format(
            "images.responsive".cyan,
            "{0} {1}".format(files.length, grunt.util.pluralize(files, "files/file"))
        ));

        compileMatches(files, function(matches){

            cutResponsiveImages(matches, function(outputs){

                if(!outputs){

                    grunt.log.ok("{0} : {1} skipped".format(
                        "images.responsive".cyan,
                        "{0} {1}".format(files.length, grunt.util.pluralize(files, "files/file"))
                    ));

                }

                compress(outputs).then(resolve);

            });

        });

    });

}