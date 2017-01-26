

/* ------------------------------------------------------------------------ */
/*
        horde.util.config
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        function
*/
/* ------------------------------------------------------------------------ */


var extend = require("deep-extend");

var replaceStr = function(str, config){

    if(str.match(/<\%|\%>/gi)){

        var variable = str.replace(/.*?<\%(.*?)\%>.*/gi, "$1").trim().split(".");
        var val = extend({}, config);

        variable.forEach(function(index){
            val = val[index];
        });

        str = str.replace(/(<\%.*?\%>)/gi, val);

    }

    return str;

};

var replace = function(property, config){

    if(typeof property === "string"){

        property = replaceStr(property, config);

    }else if(config[property] instanceof RegExp){

    }else if(config[property] instanceof Array){

        for(var i = 0; i < property.length; i++){
            property[i] = replace(property[i], config);
        }

    }else if(property instanceof Object){

        for(p in property){

            var replaceKey = replaceStr(p, config);
            var rep = replace(property[p], config);

            if(p !== replaceKey){

                delete property[p];

                property[replaceKey] = rep;


            }else{

                property[p] = rep;

            }

        }

    }

    return property;

};

module.exports = function(config){

    return replace(config, config);

};
