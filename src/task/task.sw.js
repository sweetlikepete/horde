

/* ------------------------------------------------------------------------ */
/*
        horde.task.sw
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


/* ------------------------------------------------------------------------ */
/*
        config
*/
/* ------------------------------------------------------------------------ */


var defaults = {
    precache : {
        ignoreUrlParametersMatching : [/./],
        verbose : false
    }
};


module.exports = {


    /* -------------------------------------------------------------------- */
    /*
            functions
    */
    /* -------------------------------------------------------------------- */


    generate : function(workers){

        var swPrecache = require("sw-precache");

        return new Promise(function(resolve, reject){

            var next = function(index){

                index = index || 0;

                worker = workers[index];

                if(!worker){

                    resolve();

                }else{

                    swPrecache.write(
                        worker.dest,
                        util.extend(defaults.precache, worker.precache),
                        function(error){

                            if(error){

                                reject(error);

                            }else{

                                util.log.ok("{0} : generated : {1}".format(
                                    "service-worker".cyan,
                                    util.path.shorten(workers[index].dest).grey
                                ));

                            }

                            next(index + 1);

                        }
                    );

                }

            };

            next();

        });

    }

};
