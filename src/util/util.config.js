

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

    if(str.match(/<\%|\%>/gi) !== null){

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

    }else if(property instanceof RegExp){

    }else if(property instanceof Array){

        for(var i = 0; i < property.length; i++){
            property[i] = replace(property[i], config);
        }

    }else if(property instanceof Object){

        var temp = {};

        for(p in property){

            var key = replaceStr(p, config);
            var rep = replace(property[p], config);

            if(p !== key){

                temp[key] = rep;

            }else{

                temp[p] = rep;

            }

        }

        property = temp;

    }

    return property;

};

module.exports = function(config){

    return replace(replace(config, config), config);

};
