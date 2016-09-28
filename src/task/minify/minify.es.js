

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

        var babel = require("babel-core");
        var grunt = require("grunt");
        var path = require("path");

        var input = compile.output(file);
        var output = this.output(file);
        var task = "minify";
        var ext = "es";

        return new Promise(function(resolve, reject){

            if(
                input === output ||
                util.cache.cached(file.path, file.ext, "minify")
            ){
                return resolve();
            }

            var res = babel.transformFileSync(file.path, {
                sourceFileName : path.relative(path.dirname(output), file.path),
                sourceMapTarget : path.basename(output),
                sourceMap : true,
                comments : false,
                presets : [
                    require.resolve("babel-preset-babili")
                ]
            });

            var sourceMappingURL = "\n//# sourceMappingURL=" + path.basename(output) + ".map";

            grunt.file.write(output + ".map", JSON.stringify(res.map));

            util.process.write(file.path, output, res.code + sourceMappingURL + "\n", ext, task, resolve);

        });

    }


};
