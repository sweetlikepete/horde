

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

    files = utils.files.expand(paths);

    return new Promise(function(resolve, reject){

        var grunt = require("grunt");

        files.forEach(function(file){

            grunt.file.delete(file);

            grunt.log.ok("{0} : {1}".format("clean".cyan, file.green));

        });

    });

};