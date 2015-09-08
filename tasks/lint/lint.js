

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
                less : utils.files.expand(paths, "less"),
                js : utils.files.expand(paths, "js")
            };

            utils.promise()
            .then(function(){

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