

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

        var grunt = require("grunt");
        var sass = require("node-sass");

        options = util.extend({}, options);

        var output = this.output(file, options);

        var task = "compile";
        var ext = "scss";

        return new Promise(function(resolve, reject){

            if(util.cache.cached(file.path, ext, task)){
                return resolve(output);
            }

            var opts = JSON.parse(JSON.stringify(options.scss || {}));

            opts.file = file.path;

            sass.render(opts, function(error, response){

                if(error){

                    reject(error);

                }else{

                    util.process.write(file.path, output, response.css, ext, task, resolve);

                }

            });

        });

    }

};