

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

        var minified = file.path.match(/[\.\-]min\.js$/g);

        if(minified){
            return file.path;
        }

        var output = path.relative(file.cwd, file.path.replace(/(.*?)\.([A-Za-z]*)$/g, "$1.min.js"));

        return path.join(file.build, "minifications", file.dest, output);

    },

    file : function(file, options){

        var uglify = require("uglify-js");

        var input = compile.output(file);

        var output = this.output(file);

        return new Promise(function(resolve, reject){

            if(
                input === output ||
                util.cache.cached(file.path, "js", "minify")
            ){
                return resolve();
            }

            var code = uglify.minify(input).code;

            util.process.write(file.path, output, code, "js", "minify", resolve);

        });

    }


};
