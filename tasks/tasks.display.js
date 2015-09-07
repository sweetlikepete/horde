

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


var grunt = require("grunt");
var bower = require("bower");
var path = require("path");

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

    now : function(message){

        return new Promise(function(resolve, reject){

            var grunt = require("grunt");

            var now = new Date().getTime();

            message = message || "Completed".cyan;

            console.log("");

            grunt.log.ok("{0} at {1}".format(
                message,
                utils.formatDate(now)["green"]
            ));

            resolve();

        });

    },

    say : function(message){

        return new Promise(function(resolve, reject){

            utils.execSync("say -v 'Zarvox' '{0}'&".format(message));

            resolve();

        });

    }

}