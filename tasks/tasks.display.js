

/* ------------------------------------------------------------------------ */
/*
        tasks.display
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


module.exports = {

    image : function(path, width){

        return new Promise(function(resolve, reject){

            var pictureTube = require("picture-tube");
            var fs = require("fs");

            width = Number(width) || 50;

            var tube = pictureTube({
                cols : Math.floor(process.stdout.columns / (100 / width))
            });

            tube.pipe(process.stdout);

            console.log("");

            fs.createReadStream(path).pipe(tube).on("end", function(){

                console.log("");

                resolve();

            });

        });

    },

    complete : function(message){

        return new Promise(function(resolve, reject){

            var grunt = require("grunt");
            var now = new Date().getTime();

            message = message || "Completed";

            console.log("");

            grunt.log.ok("{0} at {1}".format(
                message.cyan,
                utils.formatDate(now).green
            ));

            utils.execSync("say -v 'Zarvox' '{0}'&".format(message));

            resolve();

        });

    }

}