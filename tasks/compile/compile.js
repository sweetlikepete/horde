

/* ------------------------------------------------------------------------ */
/*
        tasks.compile
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var utils = require("./../../utils/utils.js");

var less = require("./compile.less.js");


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {

    all : function(paths, options){

        var options = options || {};

        return new Promise(function(resolve, reject){

            var folders = utils.files.expand(paths);

            var files = {
                less : utils.files.expand(
                    utils.files.addWildExtension(paths, "less")
                )
            };

            var opts = {
                cwd : options.cwd,
                dest : options.dest
            };

            utils.promise()
            .then(function(){

                return less(
                    files.less,
                    utils.extend(opts,
                        utils.extend({
                            less : {
                                paths : folders
                            }
                        },
                        {
                            less : options.less
                        })
                    )
                );

            })
            .then(resolve);

        });

    },

    less : less

}