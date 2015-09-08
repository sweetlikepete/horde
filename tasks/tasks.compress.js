

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

var css = require("./minify/minify.css.js");
var js = require("./minify/minify.js.js");


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

    var humanize = require("humanize");
    var grunt = require("grunt");
    var path = require("path");
    var fs = require("fs");

    var source = "";
    var cwd = process.cwd() + "/";

    output = path.join(options.bundle.cwd, (options.bundle.dest || ""), output);

    if(!files.length){
        return;
    }

    for(var i = 0; i < files.length; i++){

        var file = path.join(options.bundle.cwd, files[i]);
        var out = String(file);
        var ext = path.extname(file);

        if(ext === ".js" && !file.match(/[\.\-]min\.js$/g)){
            out = out.replace(/(.*?).js$/g, "$1.min.js");
        }else if(ext === ".css" && !file.match(/[\.\-]min\.css$/g)){
            out = out.replace(/(.*?).css$/g, "$1.min.css");
        }else if(ext === ".less"){
            out = out.replace(/(.*?).less$/g, "$1.min.css");
        }

        if(!fs.existsSync(out)){

            out = utils.files.getRelativePath(out, options.minify);

            if(!fs.existsSync(out)){

                if(ext === ".js"){
                    minify.js([file], options.minify);
                }else if(ext === ".css"){
                    minify.css([file], options.minify);
                }

            }

        }

        if(!fs.existsSync(out)){
            grunt.fail.fatal("File not found {0}".format(out.replace(cwd, "")));
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

    }

    grunt.file.write(output, source);

    var stat = fs.statSync(output);

    grunt.log.ok("{0} : File created : {1} → {2}".format(
        "compress.bundles".cyan,
        output.replace(cwd, "").grey,
        humanize.filesize(stat["size"]).green
    ));

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

        for(var i = 0; i < comps.length; i++){

            var groups = getGroups(comps[i].files);

            combine("css", "{0}.min.css".format(comps[i].target), groups.css, options);
            combine("js", "{0}.min.js".format(comps[i].target), groups.js, options);

        }

        resolve();

    });

};
