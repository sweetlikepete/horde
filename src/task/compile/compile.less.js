

/* ------------------------------------------------------------------------ */
/*
        horde.task.compile.less
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

        var output = path.relative(file.cwd, file.path.replace(/(.*?).less$/g, "$1.css"));

        return path.join(file.build, "compilations", file.dest, output);

    },

    file : function(file, options){

        var grunt = require("grunt");
        var less = require("less");

        options = util.extend({}, options);

        var output = this.output(file, options);

        var task = "compile";
        var ext = "less";

        return new Promise(function(resolve, reject){

            if(util.cache.cached(file.path, ext, task)){
                return resolve(output);
            }

            less.render(grunt.file.read(file.path), options.less, function(error, response){

                if(error){

                    reject(error);

                }else{

                    util.process.write(file.path, output, response.css, ext, task, resolve);

                }

            });

        });

    }

};