

/* ------------------------------------------------------------------------ */
/*
        tasks.compress
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var utils = require("./../utils/utils.js");
var minify = require("./minify/minify.js");
var compile = require("./compile/compile.js");


/* ------------------------------------------------------------------------ */
/*
        private
*/
/* ------------------------------------------------------------------------ */


var getCompressions = function(files){

    var fs = require("fs");

    var compressions = [];

    for(var i = 0; i < files.length; i++){

        var tagsRE = /{%[ \t]*compress[^\}]*?%}[\s\S]*?{%[ \t]*endcompress[ \t]*%}/g;
        var data = fs.readFileSync(files[i], "utf8");
        var tags = data.match(tagsRE);

        if(tags){

            for(var j = 0; j < tags.length; j++){

                var tagPartsRE = /{%[ \t]*compress[^\}][ \t]*['"]([\s\S]*?)['"][ \t]*?%}([\s\S]*?){%[ \t]*endcompress[ \t]*%}/g;
                var includesRE = /<(script|link).*?(href|src)=['"](.*?)['"].*?>/g;
                var tagParts = tagPartsRE.exec(tags[j]);
                var includes = tagParts[2].match(includesRE) || [];

                var compression = {
                    target : tagParts[1].toLowerCase(),
                    files : []
                };

                for(var k = 0; k < includes.length; k++){

                    var includeRE = /<(script|link).*?(href|src)=['"](.*?)['"].*?>/g;
                    var include = includeRE.exec(includes[k]);

                    compression.files.push(include[3]);

                }

                compressions.push(compression);

            }

        }

    }

    return compressions;

};

var getGroups = function(files){

    var path = require("path");

    var css = [];
    var js = [];

    for(var i = 0; i < files.length; i++){

        var file = files[i];
        var ext = path.extname(file);

        if(ext === ".js"){
            js.push(file);
        }else if(ext === ".css"){
            css.push(file);
        }else if(ext === ".less"){
            css.push(file);
        }

    }

    return {
        css : css,
        js : js
    };

};

var combine = function(type, output, files, options){

    return new Promise(function(resolve, reject){

        var humanize = require("humanize");
        var grunt = require("grunt");
        var path = require("path");
        var fs = require("fs");

        var source = "";

        output = path.join(options.bundle.cwd, (options.bundle.dest || ""), output);

        if(!files.length){
            return resolve();
        }

        var processFiles = function(files, index){

            index = index || 0;

            if(files[index]){

                var next = function(){

                    if(files[index + 1]){

                        processFiles(files, index + 1);

                    }else{

                        grunt.file.write(output, source);

                        var stat = fs.statSync(output);

                        grunt.log.ok("{0} : File created : {1} → {2}".format(
                            "compress.bundles".cyan,
                            utils.files.shorten(output).grey,
                            humanize.filesize(stat["size"]).green
                        ));

                        resolve();

                    }

                };

                var file = path.join(options.bundle.cwd, files[index]);
                var ext = path.extname(file);
                var out = String(file);

                if(ext === ".js" && !file.match(/[\.\-]min\.js$/g)){
                    out = out.replace(/(.*?).js$/g, "$1.min.js");
                }else if(ext === ".css" && !file.match(/[\.\-]min\.css$/g)){
                    out = out.replace(/(.*?).css$/g, "$1.min.css");
                }else if(ext === ".less"){
                    out = out.replace(/(.*?).less$/g, "$1.min.css");
                }

                var done = function(){

                    if(!fs.existsSync(out)){
                        grunt.fail.fatal("File not found {0}".format(utils.files.shorten(out)));
                    }

                    var data = fs.readFileSync(out, "utf8");

                    if(options.debug){

                        if(type === "css"){
                            source += "/* {1} */\n{0}\n".format(data, file);
                        }else if(type === "js"){
                            source += "// {1}\n{0}\n".format(data, file);
                        }

                    }else{
                        source += "\n" + data;
                    }

                    next();

                };

                if(!fs.existsSync(out)){

                    out = utils.files.getRelativePath(out, options.minify);

                    if(!fs.existsSync(out)){

                        if(ext === ".js"){
                            minify.js([file], options.minify).then(done);
                        }else if(ext === ".css"){
                            minify.css([file], options.minify).then(done);
                        }

                    }else{

                        done();

                    }

                }else{

                    done();

                }

            }

        };

        processFiles(files);

    });

};


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = function(paths, bundleOpts, minifyOpts){

    var grunt = require("grunt");

    options = {
        bundle : bundleOpts || {},
        minify : minifyOpts || {}
    }

    files = utils.files.expand(paths, "html");
    files = utils.cache.filter(files, "compress", "bundles");

    return new Promise(function(resolve, reject){

        var comps = getCompressions(files);

        grunt.log.ok("{0} : {1} found".format(
            "compress.bundles".cyan,
            "{0} {1}".format(comps.length, grunt.util.pluralize(comps, "matches/match"))
        ));

        comps.forEach(function(comp, index){

            var groups = getGroups(comp.files);

            utils.promise()
            .then(function(){ return combine("css", "{0}.min.css".format(comp.target), groups.css, options); })
            .then(function(){ return combine("js", "{0}.min.js".format(comp.target), groups.js, options); })
            .catch(function(err){console.log(err.stack)})
            .then(function(){

                if(index === comps.length - 1){
                     resolve();
                }

            });

        });

    });

};
