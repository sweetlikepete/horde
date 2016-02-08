

/* ------------------------------------------------------------------------ */
/*
        horde.task.open
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


    url : function(url, wait){

        util.log.ok("{0} : {1}".format("open.url".cyan, url.grey));

        var open = function(){

            util.execSync("open {0}".format(url));

        };

        if(wait){

            var attempts = 0;

            var attempt = function(){

                var request = require("request");

                request(url, function(error, response, body){

                    if(!error && response.statusCode === 200){

                        open();

                    }else{

                        attempts++;

                        var time = 500 * Math.pow(2, attempts);

                        util.log.ok("{0} : {1}".format("open.url".cyan, "trying again in {0} seconds".format(time / 1000).grey));

                        setTimeout(attempt, time);

                    }

                });

            };

            attempt();

        }else{

            open();

        }

    }

};
