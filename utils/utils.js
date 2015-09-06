

/* ------------------------------------------------------------------------ */
/*
        utils
*/
/* ------------------------------------------------------------------------ */


/* -------------------------------------------------------------------- */
/*
        prototypes
*/
/* -------------------------------------------------------------------- */


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

            for(var i = 0; i < args.length; i++){
                if(typeof args[i] === "object" && typeof args[i][key] !== "undefined"){
                    return args[i][key];
                }
            }

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

    extend : require("node.extend"),

    cache : require("./utils.cache.js"),

    files : require("./utils.files.js"),

    validate : require("./utils.validate.js")

};