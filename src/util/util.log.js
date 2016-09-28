

/* ------------------------------------------------------------------------ */
/*
        horde.util.log
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var grunt = require("grunt");


/* ------------------------------------------------------------------------ */
/*
        private
*/
/* ------------------------------------------------------------------------ */


var enabled =
    process.title === "grunt" ||
    process.argv.indexOf("-v") > -1;


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


    ok : function(){

        if(enabled){

            grunt.log.ok.apply(this, arguments);

        }

    },

    warn : function(){

        if(enabled){

            grunt.log.warn.apply(this, arguments);

        }

    },

    error : function(err){

        if(enabled){

            if(err instanceof Array){

                for(var i = 0; i < err.length; i++){

                    this.raw("");
                    this.error(err[i]);

                }

            }else{

                if(err && err.formatted){
                    grunt.log.error(err.formatted);
                }else if(err && err.stack){
                    grunt.log.error(err.stack);
                }else if(err && err.message){
                    grunt.log.error(err.stack);
                }else{
                    grunt.log.error(err);
                }

            }

        }

    },

    writeln : function(){

        if(enabled){

            grunt.log.writeln.apply(this, arguments);

        }

    },

    raw : function(){

        if(enabled){

            console.log.apply(this, arguments);

        }

    }


};
