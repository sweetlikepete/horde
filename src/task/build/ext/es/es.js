

/* ------------------------------------------------------------------------ */
/*
        horde.task.build.ext.es.js
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var util = require("./../../../../util/util.js");
var linter = require("./../../../lint/lint.js.js")


/* ------------------------------------------------------------------------ */
/*
        private
*/
/* ------------------------------------------------------------------------ */


var minify = function(file, options){

    var babel = require("babel-core");

    var res = babel.transformFileSync(file.path, {
        comments : false,
        presets : [
            require.resolve("babel-preset-babili")
        ]
    });

    return res.code;

};

var lint = function(file, options){

    return new Promise(function(resolve, reject){

        linter.file(file, options).then(resolve, reject);

    });

};

var output = function(file){

    var path = require("path");

    return path.join(file.build, file.dest, path.relative(file.cwd, file.path));

};



/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {

    build : function(file, options){

        return new Promise(function(resolve, reject){

            if(util.cache.cached(file.path, file.ext, "build")){
                return resolve();
            }

            lint(file, options).then(function(){

                var code = minify(file);

                util.process.write(file.path, output(file), code, file.ext, "build", resolve);

            }, reject);

        });

    }

}
