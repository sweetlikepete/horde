

/* ------------------------------------------------------------------------ */
/*
        tasks.minify.css
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
    files = utils.files.filterExt(files, [".min.css", "-min.css"]);
    files = utils.cache.filter(files, "minify", "css");

    return new Promise(function(resolve, reject){

        if(!files || files.length === 0){
            return resolve();
        }

        var cssmin = require("cssmin");
        var grunt = require("grunt");

        files.forEach(function(file){

            var dest = String(file);
            var code = grunt.file.read(file);

            if(!dest.match(/[\.-]min.css$/)){

                dest = dest.replace(/(.*?).css$/g, "$1.min.css");
                code = cssmin(code);

            }

            dest = utils.files.getRelativePath(dest, options);

            if(dest !== file){

                utils.files.writeMinification(dest, code, file, "minify.css");

            }

        });

        utils.cache.set(files, "minify", "css");

        resolve();

    });

}
