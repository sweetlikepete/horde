

/* ------------------------------------------------------------------------ */
/*
        tasks.lint
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var utils = require("./../../utils/utils.js");

var jscs = require("./lint.jscs.js");
var jshint = require("./lint.jshint.js");
var less = require("./lint.less.js");
var sass = require("./lint.sass.js");


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {

    all : function(paths, options){

        var options = options || {};

        var ext = function(paths, ext){

            paths = paths.slice(0);

            for(var i = 0; i < paths.length; i++){
                paths[i] = paths[i] += "/**/*." + ext;
                paths[i] = paths[i].replace(/\/\//g, "/");
            }

            return paths;

        };

        return new Promise(function(resolve, reject){

            var folders = utils.files.expand(paths);

            var files = {
                less : utils.files.expand(ext(paths, "less")),
                js : utils.files.expand(ext(paths, "js"))
            };

            utils.promise().then(function(){

                return jshint(files.js, options.jshint)

            })
            .then(function(){

                return jscs(files.js, options.jscs);

            })
            .then(function(){

                return less(files.less, utils.extend({
                    less : {
                        paths : folders
                    }
                }, options.less));

            })
            .catch(reject)
            .then(resolve);

        });

    },

    jscs : jscs,

    jshint : jshint,

    less : less

}