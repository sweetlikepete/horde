

/* ------------------------------------------------------------------------ */
/*
        horde.util
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        prototypes
*/
/* ------------------------------------------------------------------------ */


String.prototype.format = function(){

    var args = arguments;

    this.unkeyed_index = 0;

    return this.replace(/\{(\w*)\}/g, function(match, key){

        if(key === ""){

            key = this.unkeyed_index;
            this.unkeyed_index++;

        }

        if(key === String(+key)){

            return args[key] !== "undefined" ? args[key] : match;

        }else{

            args.forEach(function(arg){
                if(typeof arg === "object" && typeof arg[key] !== "undefined"){
                    return arg[key];
                }
            });

            return match;

        }

    }.bind(this));

};


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {


    /* -------------------------------------------------------------------- */
    /*
            sub-modules
    */
    /* -------------------------------------------------------------------- */


    cache : require("./util.cache.js"),

    file : require("./util.file.js"),

    log : require("./util.log.js"),

    path : require("./util.path.js"),

    process : require("./util.process.js"),

    validate : require("./util.validate.js"),


    /* -------------------------------------------------------------------- */
    /*
            function shortcuts
    */
    /* -------------------------------------------------------------------- */


    config : require("./util.config.js"),

    extend : require("deep-extend"),


    /* -------------------------------------------------------------------- */
    /*
            functions
    */
    /* -------------------------------------------------------------------- */


    execSync : function(command){

        require("child_process").execSync(command, { stdio : [0, 1, 2] });

    },

    formatDate : function(time, format){

        var dateFormat = require("dateformat");

        return dateFormat(time, format || "h:MM:ss TT");

    },

    promise : function(){

        var args = arguments;

        return new Promise(function(resolve, reject){

            resolve.apply(this, args);

        });

    }

};