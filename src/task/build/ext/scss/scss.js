

/* ------------------------------------------------------------------------ */
/*
        horde.task.build.ext.scss.js
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var util = require("./../../../../util/util.js");
var linter = require("./../../lint/css/css.js");
var minifier = require("./../../minify/css/css.js");


/* ------------------------------------------------------------------------ */
/*
        private
*/
/* ------------------------------------------------------------------------ */


var minify = function(code){

    return minifier.minify(code);

};

var compile = function(file, options){

    var sass = require("node-sass");
    var grunt = require("grunt");

    options = util.extend({}, options);

    var opts = JSON.parse(JSON.stringify(options.scss || {}));

    opts.data = grunt.file.read(file.path);

    var render = "";

    if(opts.data.trim() !== ""){

        try{

            render = sass.renderSync(opts).css;

        }catch(e){

            reject(e);

            return;

        }

    }

    return render.toString("utf8");

};

var lint = function(file, data, options){

    return new Promise((resolve, reject) => {

        linter.lint(file, data, options).then(resolve, reject);

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

        return new Promise((resolve, reject) => {

            if(util.cache.cached(file.path, file.ext, "build")){
                return resolve();
            }

            var code = compile(file, options);

            lint(file, code, options).then(function(){

                util.process.write(file.path, output(file), minify(code), file.ext, "build", resolve);

            }, reject);

        });

    }

}
