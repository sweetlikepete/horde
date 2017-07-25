

/* ------------------------------------------------------------------------ */
/*
        horde.task.build.ext.js.js
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var util = require("./../../../../util/util.js");
var lint = require("./../../../lint/lint.js.js")


/* ------------------------------------------------------------------------ */
/*
        private
*/
/* ------------------------------------------------------------------------ */


var minify = function(file, options){

    var uglify = require("uglify-js");
    var grunt = require("grunt");

    return uglify.minify(grunt.file.read(file.path), {
        output : {
            comments : false
        }
    }).code;

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

            lint.file(file, options).then(function(){

                var code = minify(file);

                util.process.write(file.path, output(file), code, file.ext, "build", resolve);

            }, reject);

        });

    }

}
