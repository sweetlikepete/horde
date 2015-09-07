

/* ------------------------------------------------------------------------ */
/*
        utils.files
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {

    cache : require("./utils.cache.js"),

    expand : function(paths){

        paths = paths.slice(0);

        var grunt = require("grunt");
        var path = require("path");

        if(typeof paths === "string"){
            paths = [paths];
        }

        for(var i = 0; i < paths.length; i++){

            var exclude = paths[i].indexOf("!") === 0;

            paths[i] = paths[i].replace("!", "");
            paths[i] = paths[i].replace(/^\s+|\s+$/g, "");

            if(paths[i].indexOf("/") !== "/"){
                paths[i] = path.resolve(process.cwd(), paths[i]);
            }

            if(exclude){
                paths[i] = "!" + paths[i];
            }

        }

        return grunt.file.expand(paths);

    },

    addWildExtension : function(paths, ext){

        paths = paths.slice(0);

        for(var i = 0; i < paths.length; i++){

            paths[i] = paths[i] += "/**/" + (ext.indexOf("*") === -1 ? "*." + ext : ext);
            paths[i] = paths[i].replace(/\/\//g, "/");

        }

        return paths;

    },

    getRelativePath : function(dest, options){

        var path = require("path");

        options = options || {};

        if(options.cwd && options.dest){

            var rel = path.relative(options.cwd, dest);
            var base = dest.split(rel)[0];

            dest = path.join(base, options.dest, rel);

        }

        return dest;

    },

    writeMinification : function(dest, output, original){

        var humanize = require("humanize");
        var grunt = require("grunt");
        var path = require("path");
        var fs = require("fs");

        grunt.file.write(dest, output);

        var stat1 = fs.statSync(original);
        var stat2 = fs.statSync(dest);

        grunt.log.ok("File {0} created: {1} → {2}".format(
            dest["cyan"],
            humanize.filesize(stat1["size"])["green"],
            humanize.filesize(stat2["size"])["green"]
        ));

    }

};