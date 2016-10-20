

/* ------------------------------------------------------------------------ */
/*
        horde.task.display
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
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {


    /* -------------------------------------------------------------------- */
    /*
            functions
    */
    /* -------------------------------------------------------------------- */


    image : function(path, width){

        return new Promise(function(resolve, reject){

            var pictureTube = require("picture-tube");
            var fs = require("fs");

            width = Number(width) || 50;

            var tube = pictureTube({
                cols : Math.floor(process.stdout.columns / (100 / width))
            });

            tube.pipe(process.stdout);

            util.log.raw("");

            fs.createReadStream(path).pipe(tube).on("end", function(){

                util.log.raw("");

                resolve();

            });

        });

    },

    complete : function(message){

        return new Promise(function(resolve, reject){

            var grunt = require("grunt");
            var now = new Date().getTime();

            message = message || "Completed";

            util.log.raw("");

            util.log.ok("{0} at {1}".format(
                message.cyan,
                util.formatDate(now).green
            ));

            util.execSync("say -v 'Fred' '{0}'&".format(message));

            resolve();

        });

    },

    failed : function(message){

        return new Promise(function(resolve, reject){

            var grunt = require("grunt");
            var now = new Date().getTime();

            message = message || "Failed";

            util.log.raw("");

            util.log.error("{0} at {1}".format(
                message.red,
                util.formatDate(now).grey
            ));

            util.execSync("say -v 'Fred' '{0}'&".format(message));

            resolve();

        });

    }

};
