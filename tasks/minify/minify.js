

/* ------------------------------------------------------------------------ */
/*
        tasks.minify
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var utils = require("./../../utils/utils.js");

var css = require("./minify.css.js");
var js = require("./minify.js.js");


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
                css : utils.files.expand(
                    utils.files.addWildExtension(paths, "css")
                ),
                js : utils.files.expand(
                    utils.files.addWildExtension(paths, "js")
                )
            };

            utils.promise()
            .then(function(){

                return css(files.css, options);

            })
            .then(function(){

                return js(files.js, options);

            })
            .catch(reject)
            .then(resolve);

        });

    },

    css : css,

    js : js

}