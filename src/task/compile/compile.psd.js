

/* ------------------------------------------------------------------------ */
/*
        horde.task.compile.psd
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
    cache : ".cache/task.compile.psd",
    multiples : [1, 2, 4],
    task : "compile",
    ext : "psd"
};

var cachePath = function(file){

    var path = require("path");

    return path.join(path.dirname(file.path), config.cache, path.basename(file.path));

};

var cached = function(files, outputs){

    var fs = require("fs");

    var outputsExist = true;
    var filesMatch = true;

    outputs = outputs instanceof Array ? outputs : [outputs];
    files = files instanceof Array ? files : [files];

    for(var i = 0; i < outputs.length; i++){

        if(!fs.existsSync(outputs[i])){

            outputsExist = false;
            break;

        }

    }

    for(var j = 0; j < files.length; j++){

        var cache = cachePath(files[j]);

        if(
            !fs.existsSync(cache) ||
            util.cache.hashFile(files[j].path) !== util.cache.hashFile(cache)
        ){

            filesMatch = false;
            break;

        }

    }

    if(outputsExist === true && filesMatch === true){
        return true;
    }

    return false;

};

var processors = {

    batch : function(file, done){

        var humanize = require("humanize");
        var fse = require("fs-extra");
        var grunt = require("grunt");
        var path = require("path");
        var PSD = require("psd");
        var gm = require("gm");
        var fs = require("fs");

        var ext = path.extname(path.basename(file.path, ".psd")).replace(/\./g, "").toLowerCase();

        var getOutputs = function(sizes){

            var outputs = {
                paths : [],
                sizes : []
            };

            for(var i = 0; i < sizes.length; i++){

                var outputPath = path.join(path.dirname(file.path), path.basename(file.path, ".resize.{0}.psd".format(ext)));
                var size = sizes[i];

                if(typeof size === "number" || typeof size === "string"){
                    size = [Number(size), Number(size)];
                }

                if(size instanceof Array && size.length >= 2){

                    outputPath = "{0}.{1}x{2}.{3}".format(outputPath, size[0], size[1], ext);

                    outputs.paths.push(outputPath);
                    outputs.sizes.push(size);

                }

            }

            return outputs;

        };

        return new Promise(function(resolve, reject){

            var conf = JSON.parse(JSON.stringify(file));

            conf.path = path.join(path.dirname(file.path), path.basename(file.path, ".psd") + ".json");

            if(fs.existsSync(conf.path)){

                var cf = grunt.file.readJSON(conf.path);
                var sizes = cf.sizes;
                var rotate = cf.rotate || 0;

                if(sizes && sizes.length){

                    var outputs = getOutputs(sizes);

                    if(cached([file, conf], outputs.paths)){

                        resolve();

                    }else{

                        var temp = path.join(path.dirname(file.path), config.cache, path.basename(file.path) + ".png");

                        PSD.open(file.path).then(function(psd){

                            grunt.file.mkdir(path.dirname(temp));

                            return psd.image.saveAsPng(temp);

                        }).then(function(){

                            var stat1 = fs.statSync(file.path);

                            var next = function(index){

                                if(index !== outputs.paths.length){

                                    index = index || 0;

                                    gm(temp).gravity("Center").setFormat(ext).rotate("white", rotate).thumb(
                                        outputs.sizes[index][0],
                                        outputs.sizes[index][1],
                                        outputs.paths[index],
                                        100,
                                        function(){

                                            var stat2 = fs.statSync(outputs.paths[index]);

                                            util.log.ok("{0} : write : {1} {2} → {3}".format(
                                                "{0}.{1}".format(config.ext, config.task).cyan,
                                                util.path.shorten(outputs.paths[index]).grey,
                                                humanize.filesize(stat1["size"]).green,
                                                humanize.filesize(stat2["size"]).green
                                            ));

                                            next(index += 1);

                                        }
                                    );

                                }else{

                                    fse.copySync(file.path, cachePath(file));
                                    fse.copySync(conf.path, cachePath(conf));

                                    resolve();

                                }

                            };

                            next();

                        });

                    }

                }else{

                    reject("Config does not contain size settings for {0}".format(file.path));

                }

            }else{

                reject("Config does not exist for {0}".format(file.path));

            }

        });

    },

    resize : function(file, done){

        var humanize = require("humanize");
        var fse = require("fs-extra");
        var grunt = require("grunt");
        var path = require("path");
        var PSD = require("psd");
        var fs = require("fs");
        var gm = require("gm");

        var ext = path.extname(path.basename(file.path, ".psd")).replace(/\./g, "").toLowerCase();

        var getOutputs = function(){

            return new Promise(function(resolve, reject){

                var re = /(.*?)@(\d)x.(.*).psd$/i;
                var format = file.path.replace(re, "$3");
                var size = Number(file.path.replace(re, "$2"));
                var cuts = config.multiples.filter(function(value){
                    return value <= this;
                }, size);

                var outputs = {
                    paths : [],
                    sizes : []
                };

                PSD.open(file.path).then(function(psd){

                    var ow = psd.header.width;
                    var oh = psd.header.height;

                    for(var i = 0; i < cuts.length; i++){

                        var outputPath = path.join(path.dirname(file.path), path.basename(file.path, ".{0}.psd".format(ext)));

                        outputPath = outputPath.replace(/@([0-9]*)x$/i, "");
                        outputPath = outputPath + (cuts[i] > 1 ? "@{0}x".format(cuts[i]) : "") + ".{0}".format(ext);

                        outputs.paths.push(outputPath);

                        outputs.sizes.push([
                            Math.ceil(ow * (cuts[i] / size)),
                            Math.ceil(oh * (cuts[i] / size))
                        ]);

                    }

                    resolve(outputs);

                });

            });

        };

        return new Promise(function(resolve, reject){

            getOutputs().then(function(outputs){

                if(cached(file, outputs.paths)){

                    resolve();

                }else{

                    var temp = path.join(path.dirname(file.path), config.cache, path.basename(file.path) + ".png");

                    PSD.open(file.path).then(function(psd){

                        grunt.file.mkdir(path.dirname(temp));

                        return psd.image.saveAsPng(temp);

                    }).then(function(){

                        var stat1 = fs.statSync(file.path);

                        var next = function(index){

                            if(index !== outputs.paths.length){

                                index = index || 0;

                                gm(temp).setFormat(ext).thumb(
                                    outputs.sizes[index][0],
                                    outputs.sizes[index][1],
                                    outputs.paths[index],
                                    100,
                                    function(){

                                        var stat2 = fs.statSync(outputs.paths[index]);

                                        util.log.ok("{0} : write : {1} {2} → {3}".format(
                                            "{0}.{1}".format(config.ext, config.task).cyan,
                                            util.path.shorten(outputs.paths[index]).grey,
                                            humanize.filesize(stat1["size"]).green,
                                            humanize.filesize(stat2["size"]).green
                                        ));

                                        next(index += 1);

                                    }
                                );

                            }else{

                                fse.copySync(file.path, cachePath(file));

                                resolve();

                            }

                        };

                        next();

                    });

                }

            });

        });

    },

    convert : function(file, done){

        var humanize = require("humanize");
        var fse = require("fs-extra");
        var grunt = require("grunt");
        var path = require("path");
        var PSD = require("psd");
        var gm = require("gm");
        var fs = require("fs");

        var output = file.path.replace(/.\psd$/g, "");
        var outputExt = path.extname(output).replace(/\./g, "").toLowerCase();

        return new Promise(function(resolve, reject){

            if(cached(file, output)){

                resolve();

            }else{

                PSD.open(file.path).then(function(psd){

                    var temp = path.join(path.dirname(file.path), config.cache, path.basename(file.path) + ".png");

                    PSD.open(file.path).then(function(psd){

                        grunt.file.mkdir(path.dirname(temp));

                        return psd.image.saveAsPng(temp);

                    }).then(function(){

                        gm(temp).setFormat(outputExt).quality(90).write(output, function(error){

                            if(error){

                                reject(error);

                            }else{

                                var stat1 = fs.statSync(file.path);
                                var stat2 = fs.statSync(output);

                                fse.copySync(file.path, cachePath(file));

                                util.log.ok("{0} : write : {1} {2} → {3}".format(
                                    "{0}.{1}".format(config.ext, config.task).cyan,
                                    util.path.shorten(output).grey,
                                    humanize.filesize(stat1["size"]).green,
                                    humanize.filesize(stat2["size"]).green
                                ));

                                resolve();

                            }

                        });

                    });

                });

            }

        });

    }

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

        return new Promise(function(resolve, reject){

            var f = file.path.toLowerCase();

            if(f.match(/\.resize\.(png|jpg|jpeg|gif)\.psd$/g)){

                processors.batch(file).then(resolve, reject);

            }else if(f.match(/@[0-9]x\.(png|jpg|jpeg|gif)\.psd$/g)){

                processors.resize(file).then(resolve, reject);

            }else if(f.match(/\.(png|jpg|jpeg|gif)\.psd$/g)){

                processors.convert(file).then(resolve, reject);

            }else{

                resolve();

            }

        });

    }

};
