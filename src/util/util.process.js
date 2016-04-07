

/* ------------------------------------------------------------------------ */
/*
        horde.util.process
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var util = {
    extend : require("node.extend"),
    cache : require("./util.cache.js"),
    file : require("./util.file.js"),
    path : require("./util.path.js"),
    log : require("./util.log.js")
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


    write : function(source, destination, output, extension, task, resolve){

        var humanize = require("humanize");
        var grunt = require("grunt");
        var fs = require("fs");

        grunt.file.write(destination, output);

        var stat1 = fs.statSync(source);
        var stat2 = fs.statSync(destination);

        util.log.ok("{0} : write : {1} {2} → {3}".format(
            "{0}.{1}".format(extension, task).cyan,
            util.path.shorten(destination).grey,
            humanize.filesize(stat1["size"]).green,
            humanize.filesize(stat2["size"]).green
        ));

        util.cache.set(source, extension, task);

        resolve(destination);

    },

    expand : function(config){

        config = JSON.parse(JSON.stringify(config));
        config.options = config.options || {};

        var extend = require("deep-extend");
        var grunt = require("grunt");
        var path = require("path");

        var folders = config.folders;
        var files = [];

        for(var index in folders){

            var folder = folders[index];

            if(typeof folder === "string"){

                folder = {
                    dest : folder,
                    options : {}
                };

            }

            folder.cwd = index;
            folder.options = JSON.parse(JSON.stringify(extend(config.options, folder.options)));

            var ignore = folder.ignore || [];

            if(typeof ignore === "string"){
                ignore = [ignore];
            }

            for(var i = 0; i < ignore.length; i++){
                ignore[i] = "! " + ignore[i] + "/**";
            }

            var exp = grunt.file.expand([index + "/**/*.*"].concat(ignore));

            for(var j = 0; j < exp.length; j++){

                files.push({
                    ext : path.extname(exp[j]).replace(/\./g, "").toLowerCase(),
                    folders : config.folders,
                    options : folder.options,
                    build : config.build,
                    dest : folder.dest,
                    cwd : folder.cwd,
                    folder : folder,
                    path : exp[j]
                });

            }

        }

        return files;

    },

    output : function(file, options){

        var path = require("path");

        if(file.folder.ignore){

            var ignores = (file.folder.ignore instanceof Array) ? file.folder.ignore : [file.folder.ignore];

            for(var i = 0; i < ignores.length; i++){

                if(file.path.indexOf(ignores[i]) === 0){
                    return file.path;
                }

            }

        }

        if(this.exts[file.ext] && this.exts[file.ext].output){

            return this.exts[file.ext].output(file, options);

        }

        return file.path;

    },

    file : function(file, options){

        var path = require("path");
        var fs = require("fs");

        var self = this;

        options = util.extend({}, options);

        return new Promise(function(resolve, reject){

            if(fs.existsSync(file.path)){

                if(self.exts[file.ext] && self.exts[file.ext].file){

                    self.exts[file.ext].file(file, options).then(resolve, reject);

                }else{

                    resolve();

                }

            }else{

                reject("File does not exist");

            }

        });

    }


};
