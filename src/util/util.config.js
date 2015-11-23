

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


module.exports = function(config){

    var str = JSON.stringify(config);
    var i = 0;

    var rep = function(match, text){

        var variable = text.replace(/<\%|\%>/gi, "").trim().split(".");
        var value = config;

        for(var i = 0; i < variable.length; i++){

            var v = variable[i];

            if(value[v]){

                value = value[v];

            }else{

                value = text;
                break;

            }

        }

        return String(value);

    };

    while(true){

        var s = str.replace(/(<\%.*?\%>)/gi, rep);

        if(str !== s){
            str = s;
        }else{
            break;
        }

    }

    config = JSON.parse(str);

    return config;

};