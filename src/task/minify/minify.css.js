

/* ------------------------------------------------------------------------ */
/*
        horde.task.minify.js
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var util = require("./../../util/util.js");

var compile = require("./../compile/compile.js");


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

        var minified = file.path.match(/[\.\-]min\.css$/g);

        if(minified){
            return file.path;
        }

        var output = path.relative(file.cwd, file.path.replace(/(.*?)\.([A-Za-z]*)$/g, "$1.min.css"));

        return path.join(file.build, "minifications", file.dest, output);

    },

    file : function(file, options){

        var cssmin = require("cssmin");
        var grunt = require("grunt");

        var input = compile.output(file);
        var output = this.output(file);

        return new Promise(function(resolve, reject){

            if(
                input === output ||
                util.cache.cached(file.path, file.ext, "minify")
            ){
                return resolve();
            }

            var code = cssmin(grunt.file.read(input));

            util.process.write(file.path, output, code, file.ext, "minify", resolve);

        });

    }


};
