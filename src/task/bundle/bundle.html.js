

/* ------------------------------------------------------------------------ */
/*
        horde.task.bundle.js
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var minify = require("./../minify/minify.js");
var util = require("./../../util/util.js");


/* ------------------------------------------------------------------------ */
/*
        private
*/
/* ------------------------------------------------------------------------ */


var resolveBundlePaths = function(compression, file){

    var path = require("path");

    var folders = file.folders;

    var files = {
        css : [],
        js : []
    };

    for(var i = 0; i < compression.files.length; i++){

        for(var index in folders){

            var folder = folders[index];

            var re = new RegExp("^\\/{0}".format(folder.dest), "g");

            if(compression.files[i].match(re)){

                var original = String(compression.files[i]);

                var p = compression.files[i].replace(re, index);

                p = minify.output({
                    ext : path.extname(p).replace(/\./g, "").toLowerCase(),
                    options : folder.options,
                    build : file.build,
                    dest : folder.dest,
                    folders : folders,
                    cwd : folder.cwd,
                    folder : folder,
                    path : p
                });

                var ext = path.extname(p).replace(/\./g, "").toLowerCase();

                if(ext === "css"){
                    files.css.push([p, original]);
                }else if(ext === "js"){
                    files.js.push([p, original]);
                }

            }

        }

    }

    compression.files = files;

    return compression;

};

var getBundles = function(file){

    var fs = require("fs");

    var tagsRE = /{%[ \t]*bundle[^\}]*?%}[\s\S]*?{%[ \t]*endbundle[ \t]*%}/g;
    var data = fs.readFileSync(file.path, "utf8");
    var tags = data.match(tagsRE);

    var compressions = [];

    if(tags){

        for(var i = 0; i < tags.length; i++){

            var tagPartsRE = /{%[ \t]*bundle[^\}][ \t]*[\'\"]([\s\S]*?)[\'\"][ \t]*?%}([\s\S]*?){%[ \t]*endbundle[ \t]*%}/g;
            var includesRE = /<(script|link).*?(href|src)=['"](.*?)['"].*?>/g;
            var tagParts = tagPartsRE.exec(tags[i]);
            var includes = tagParts[2].match(includesRE) || [];

            var compression = {
                target : tagParts[1].toLowerCase(),
                files : []
            };

            for(var j = 0; j < includes.length; j++){

                var includeRE = /<(script|link).*?(href|src)=['"](.*?)['"].*?>/g;
                var include = includeRE.exec(includes[j]);

                compression.files.push(include[3]);

            }

            compressions.push(compression);

        }

    }

    for(var k = 0; k < compressions.length; k++){

        compressions[k] = resolveBundlePaths(compressions[k], file);

    }

    return compressions;

};

var generateBundles = function(file, options){

    var bundles = getBundles(file);

    var humanize = require("humanize");
    var grunt = require("grunt");
    var path = require("path");
    var fs = require("fs");

    var process = function(type){

        return new Promise(function(resolve, reject){

            for(var i = 0; i < bundles.length; i++){

                var bundle = bundles[i];
                var source = "";

                for(var j = 0; j < bundle.files[type].length; j++){

                    var bundleFile = bundle.files[type][j][0];
                    var bundleFileOriginal = bundle.files[type][j][1];

                    if(fs.existsSync(bundleFile)){

                        var data = fs.readFileSync(bundleFile, "utf8");

                        if(options.debug){

                            if(type === "css"){
                                source += "/* {1} */\n{0}\n".format(data, bundleFileOriginal);
                            }else if(type === "js"){
                                source += "// {1}\n{0}\n".format(data, bundleFileOriginal);
                            }

                        }else{

                            source += "\n" + data;

                        }

                    }else{

                        return reject("Bundle file does not exist: {0}".format(bundleFile));

                    }

                }

                var output = path.join(file.build, "bundles", "{0}.min.{1}".format(bundle.target, type));

                grunt.file.write(output, source);

                var stat = fs.statSync(output);

                grunt.log.ok("{0} : write : {1} → {2}".format(
                    "{0}.{1}".format("html", "bundle").cyan,
                    util.path.shorten(output).grey,
                    humanize.filesize(stat["size"]).green
                ));

            }

            resolve();

        });

    };

    return new Promise(function(resolve, reject){

        util.promise()
        .then(function(){

            return process("css");

        })
        .then(function(){

            return process("js");

        })
        .then(resolve, reject);

    });

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

            generateBundles(file, options).then(resolve, reject);

        });

    }


};
