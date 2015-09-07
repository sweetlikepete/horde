

/* ------------------------------------------------------------------------ */
/*
        tasks.images.sizes
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
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = function(paths){

    paths = paths || [];

    files = utils.files.expand(
        utils.files.addWildExtension(paths, "*.resize.json")
    );

    return new Promise(function(resolve, reject){

        if(!files || files.length === 0){
            return resolve();
        }

        var humanize = require("humanize");
        var grunt = require("grunt");
        var path = require("path");
        var PSD = require("psd");
        var fs = require("fs");
        var gm = require("gm");

        var self = this;
        var cache = {};

        var cutTargets = function(callback){

            var targets = [];

            files.forEach(function(file){

                var dir = path.dirname(file);
                var targetDir = path.join(dir, "resized/.info/target");
                var json = grunt.file.readJSON(file);

                cache[file] = json;

                for(var image in cache[file]){

                    var target = {
                        png : path.join(targetDir, image),
                        dst : path.join(targetDir, image),
                        src : path.join(dir, image)
                    };

                    if(path.extname(image) === ".psd"){

                        target.png = path.join(targetDir, image.substring(0, image.length - path.extname(image).length) + ".png");
                        target.psd = path.join(dir, image);

                    }

                    targets.push(target);

                }

            });

            var processTargetCuts = function(cuts, index){

                index = index || 0;

                if(!cuts.length){
                    return callback();
                }

                if(cuts[index]){

                    var next = function(){

                        var stat = fs.statSync(cuts[index].png);

                        if(grunt.option("verbose")){

                            grunt.log.ok("Temp {0} created: {1}".format(
                                utils.files.shorten(cuts[index].png).grey,
                                humanize.filesize(stat["size"]).green
                            ));

                        }

                        if(cuts[index + 1]){
                            processTargetCuts(cuts, index + 1);
                        }else{
                            callback();
                        }

                    };

                    if(
                        fs.existsSync(cuts[index].src) &&
                        fs.existsSync(cuts[index].dst) &&
                        utils.cache.hashFile(cuts[index].src) === utils.cache.hashFile(cuts[index].dst)
                    ){
                        return next();
                    }

                    grunt.file.copy(cuts[index].src, cuts[index].dst);

                    if(cuts[index].psd){

                        grunt.file.mkdir(path.dirname(cuts[index].png));

                        PSD.open(cuts[index].psd).then(function(psd){

                            return psd.image.saveAsPng(cuts[index].png);

                        }).then(next);

                    }else{

                        next();

                    }

                }

            };

            processTargetCuts(targets);

        };

        var cutSizes = function(callback){

            var sizes = [];
            var outputs = [];

            files.forEach(function(file){

                var config = cache[file] || grunt.file.readJSON(file);
                var dir = path.dirname(file);

                for(var image in config){

                    var png = image;

                    if(path.extname(image) === ".psd"){
                        png = image.substring(0, image.length - path.extname(image).length) + ".png";
                    }

                    var previous = path.join(dir, "resized/.info/original", image);
                    var original = path.join(dir, image);
                    var input = path.join(dir, "resized/.info/target", png);
                    var extname = path.extname(input);
                    var basename = png.substring(0, png.length - extname.length);
                    var conf = config[image].length ? config[image] : config[image].sizes;

                    for(var j = 0; j < conf.length; j++){

                        var s = conf[j];
                        var width = typeof s === "number" ? s : s[0];
                        var height = typeof s === "number" ? s : s[1];
                        var output = path.join(dir, "resized", "{0}.{1}x{2}{3}".format(basename, width, height, extname));

                        if(
                            !fs.existsSync(output) ||
                            !fs.existsSync(previous) ||
                            utils.cache.hashFile(previous) !== utils.cache.hashFile(original)
                        ){

                            sizes.push({
                                input : {
                                    path : input
                                },
                                output : {
                                    path : output,
                                    width : width,
                                    height : height
                                }
                            });

                        }

                    }

                    grunt.file.copy(original, previous);

                }

            });

            var processResizes = function(resizes, index){

                index = index || 0;

                if(resizes[index]){

                    var next = function(){

                        var stat = fs.statSync(resizes[index].output.path);

                        grunt.log.ok("{0} : Image cut : {1} → {2}".format(
                            "images.sizes".cyan,
                            utils.files.shorten(resizes[index].output.path).grey,
                            humanize.filesize(stat["size"]).green
                        ));

                        outputs.push(resizes[index].output.path);

                        if(sizes[index + 1]){
                            processResizes(resizes, index + 1);
                        }else{
                            callback(outputs);
                        }

                    };

                    gm(resizes[index].input.path).thumb(
                        resizes[index].output.width,
                        resizes[index].output.height,
                        resizes[index].output.path,
                        100,
                        next
                    );

                }

            };

            if(!sizes.length){
                return callback();
            }

            processResizes(sizes);

        };

        grunt.log.ok("{0} : {1} found".format(
            "images.sizes".cyan,
            "{0} files".format(files.length)
        ));

        cutTargets(function(){

            cutSizes(function(outputs){

                if(!outputs){

                    grunt.log.ok("{0} : {1} skipped".format(
                        "images.sizes".cyan,
                        "{0} files".format(files.length)
                    ));

                }

                compress(outputs).then(resolve);

            });

        });

    });

}