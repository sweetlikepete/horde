

/* ------------------------------------------------------------------------ */
/*
        horde.task.compile.js
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

        var output = path.relative(file.cwd, file.path.replace(/(.*?).es$/g, "$1.js"));

        return path.join(file.build, "compilations", file.dest, output);

    },

    file : function(file, options){

        var babel = require("babel-core");
        var grunt = require("grunt");
        var path = require("path");

        options = util.extend({}, options);

        var output = this.output(file, options);

        var task = "compile";
        var ext = "es";

        return new Promise(function(resolve, reject){

            if(util.cache.cached(file.path, ext, task)){
                return resolve(output);
            }

            var res = babel.transformFileSync(file.path, {
                sourceFileName : path.relative(path.dirname(output), file.path),
                sourceMapTarget : path.basename(output),
                sourceMap: true,
                presets : [
                    require.resolve("babel-preset-es2015")
                ]
            });

            var sourceMappingURL = "\n//# sourceMappingURL=" + path.basename(output) + ".map"

            grunt.file.write(output + ".map", JSON.stringify(res.map));

            util.process.write(file.path, output, res.code + sourceMappingURL + "\n", ext, task, resolve);

        });

    }

};
