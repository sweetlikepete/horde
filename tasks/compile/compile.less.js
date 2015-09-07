

/* ------------------------------------------------------------------------ */
/*
        tasks.compile.less
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

    paths = paths || [];

    options = options || {};

    files = utils.files.expand(paths);
    files = utils.cache.filter(files, "compile", "less");

    return new Promise(function(resolve, reject){

        if(!files || files.length === 0){
            return resolve();
        }

        var humanize = require("humanize");
        var grunt = require("grunt");
        var less = require("less");
        var path = require("path");
        var fs = require("fs");

        var processLess = function(files, index){

            index = index || 0;

            if(files[index]){

                var data = fs.readFileSync(files[index], "utf8");
                var output = files[index].replace(/(.*?).less$/g, "$1.css");
                var last = !files[index + 1];

                options.filename = path.join(process.cwd(), files[index]);

                less.render(data, options.less, function(error, response){

                    if(error){

                        grunt.fail.fatal(error);

                    }

                    output = utils.files.getRelativePath(output, options);

                    grunt.file.write(output, response.css);

                    var stat = fs.statSync(output);

                    grunt.log.ok("{0} : File created : {1} → {2}".format(
                        "compile.less".cyan,
                        utils.files.shorten(output).grey,
                        humanize.filesize(stat["size"]).green
                    ));

                    if(!last){

                        processLess(files, index + 1);

                    }else{

                        utils.cache.set(files, "compile", "less");

                        resolve();

                    }

                });

            }

        };

        processLess(files);

    });

}
