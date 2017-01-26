

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


module.exports = {


    /* -------------------------------------------------------------------- */
    /*
            functions
    */
    /* -------------------------------------------------------------------- */


    generate : function(options){

        return new Promise(function(resolve, reject){

            var swPrecache = require("sw-precache");
            var pcOpts = options.precache;

            var opts = util.extend({
                ignoreUrlParametersMatching : [/./],
                verbose : true
            }, pcOpts);

            swPrecache.write(options.dest, opts, function(error){

                if(error){
                    reject(error);
                }else{
                    resolve();
                }

            });

        });

    }

};
