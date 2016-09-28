

/* ------------------------------------------------------------------------ */
/*
        horde.task.compile.coffee
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
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {


    /* -------------------------------------------------------------------- */
    /*
            functions
    */
    /* -------------------------------------------------------------------- */


    output : function(file){

        var path = require("path");

        var output = path.relative(file.cwd, file.path.replace(/(.*?).coffee$/g, "$1.js"));

        return path.join(file.build, "compilations", file.dest, output);

    },

    file : function(file, options){

        var grunt = require("grunt");
        var path = require("path");

        options = util.extend({}, options);

        var output = this.output(file, options);

        var task = "compile";
        var ext = "coffee";

        return new Promise(function(resolve, reject){

            if(util.cache.cached(file.path, ext, task)){
                return resolve(output);
            }

            var res = null;

            try{

                res = require("coffee-script").compile(grunt.file.read(file.path), {
                    filename : file.path,
                    sourceMap : true
                });

            }catch(err){

                reject(err);

                return;

            }

            var sourceMappingURL = "\n//# sourceMappingURL=" + path.basename(output) + ".map";

            grunt.file.write(output + ".map", JSON.stringify(res.v3SourceMap));

            util.process.write(file.path, output, res.js + sourceMappingURL + "\n", ext, task, resolve);

        });

    }

};
