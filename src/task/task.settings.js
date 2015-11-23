

/* ------------------------------------------------------------------------ */
/*
        horde.task.settings
*/
/* ------------------------------------------------------------------------ */


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


    compile : function(paths, formats){

        return new Promise(function(resolve, reject){

            var extend = require("node.extend");
            var grunt = require("grunt");
            var fs = require("fs");

            var settings = {};

            for(var i = 0; i < paths.length; i++){

                paths[i] = paths[i].format.apply(paths[i], formats);

                if(fs.existsSync(paths[i])){

                    try{
                        settings = extend(true, settings, JSON.parse(fs.readFileSync(paths[i], "utf8")));
                    }catch(e){
                        grunt.fail.fatal("Configuration file is not valid JSON: " + paths[i]);
                    }

                }

            }

            resolve(settings);

        });

    }

};
