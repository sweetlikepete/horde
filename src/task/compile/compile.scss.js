

/* ------------------------------------------------------------------------ */
/*
        horde.task.compile.scss
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

        var output = path.relative(file.cwd, file.path.replace(/(.*?).scss$/g, "$1.css"));

        return path.join(file.build, "compilations", file.dest, output);

    },

    file : function(file, options){

        var sass = require("node-sass");
        var grunt = require("grunt");

        options = util.extend({}, options);

        var output = this.output(file, options);

        var task = "compile";
        var ext = "scss";

        return new Promise(function(resolve, reject){

            if(util.cache.cached(file.path, ext, task)){
                return resolve(output);
            }

            var opts = JSON.parse(JSON.stringify(options.scss || {}));

            opts.data = grunt.file.read(file.path);

            var render = "";

            if(opts.data.trim() !== ""){

                try{

                    var render = sass.renderSync(opts);

                }catch(e){

                    reject(e);

                    return;

                }

                util.process.write(file.path, output, render.css, ext, task, resolve);

            }

        });

    }

};
