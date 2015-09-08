

/* ------------------------------------------------------------------------ */
/*
        tasks.clean
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var utils = require("./../utils/utils.js");


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = function(paths){

    return new Promise(function(resolve, reject){

        files = utils.files.expand(paths);

        var grunt = require("grunt");

        files.forEach(function(file){

            grunt.file.delete(file);

            grunt.log.ok("{0} : {1}".format("clean.files".cyan, file.grey));

        });

        resolve();

    });

};