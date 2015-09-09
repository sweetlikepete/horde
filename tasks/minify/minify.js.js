

/* ------------------------------------------------------------------------ */
/*
        tasks.minify.js
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var utils = require("./../../utils/utils.js");


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = function(paths, options){

    options = options || {};

    files = utils.files.expand(paths);
    files = utils.files.filterExt(files, [".min.js", "-min.js"]);
    files = utils.cache.filter(files, "minify", "js");

    return new Promise(function(resolve, reject){

        if(!files || files.length === 0){
            return resolve();
        }

        var uglify = require("uglify-js");
        var grunt = require("grunt");

        files.forEach(function(file){

            var dest = String(file);
            var code = grunt.file.read(file);

            if(!dest.match(/[\.-]min.js$/)){

                dest = dest.replace(/(.*?).js$/g, "$1.min.js");
                code = uglify.minify(file).code;

            }

            dest = utils.files.getRelativePath(dest, options);

            if(dest !== file){

                utils.files.writeMinification(dest, code, file, "minify.js");

            }

        });

        utils.cache.set(files, "minify", "js");

        resolve();

    });

}
