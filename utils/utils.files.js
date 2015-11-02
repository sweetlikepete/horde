

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

    shorten : function(path){

        return path.replace(process.cwd() + "/", "");

    },

    filterExt : function(paths, extensions){

        if(typeof(extensions) === "string"){
            extensions = [extensions];
        }

        extensions.forEach(function(extension){

            paths = paths.filter(function(value){
                return value.toLowerCase().indexOf(extension, value.length - extension.length) === -1;
            });

        });

        return paths;

    },

    expand : function(paths, extension){

        paths = paths || [];

        if(typeof paths === "string"){
            paths = [paths];
        }

        if(extension){
            paths = this.addWildExtension(paths, extension);
        }

        paths = paths.slice(0);

        var grunt = require("grunt");
        var path = require("path");

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

            if(ext.match(/^[a-z0-9]+$/i)){
                ext = "*." + ext;
            }

            paths[i] = paths[i] += "/**/" + ext;
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

    writeJSON : function(file, json, options){

        var jsonfile = require("jsonfile");
        var grunt = require("grunt");
        var path = require("path");

        options = options || { spaces : 2 };

        grunt.file.mkdir(path.dirname(file));

        jsonfile.writeFileSync(file, json, options);

    },

    writeMinification : function(dest, output, original, label){

        var humanize = require("humanize");
        var grunt = require("grunt");
        var path = require("path");
        var fs = require("fs");

        grunt.file.write(dest, output);

        var stat1 = fs.statSync(original);
        var stat2 = fs.statSync(dest);

        grunt.log.ok("{0} : File created : {1} {2} → {3}".format(
            label.cyan,
            this.shorten(dest).grey,
            humanize.filesize(stat1["size"]).green,
            humanize.filesize(stat2["size"]).green
        ));

    }

};