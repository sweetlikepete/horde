

/* ------------------------------------------------------------------------ */
/*
        horde.task.clean
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var util = require("./../util/util.js");


/* ------------------------------------------------------------------------ */
/*
        function
*/
/* ------------------------------------------------------------------------ */


module.exports = function(paths){

    return new Promise(function(resolve, reject){

        files = util.file.expand(paths);

        var grunt = require("grunt");

        files.forEach(function(file){

            grunt.file.delete(file,
                force: true
            });

            util.log.ok("{0} : Cleaned {1}".format("clean.files".cyan, file.grey));

        });

        resolve();

    });

};
