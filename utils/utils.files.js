

/* ------------------------------------------------------------------------ */
/*
        utils.files
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {

    cache : require("./utils.cache.js"),

    expand : function(paths){

        var grunt = require("grunt");
        var path = require("path");

        if(typeof paths === "string"){
            paths = [paths];
        }

        for(var i = 0; i < paths.length; i++){

            var exclude = paths[i].indexOf("!") === 0;

            paths[i] = paths[i].replace("!", "");
            paths[i] = paths[i].replace(/^\s+|\s+$/g, "");

            if(paths[i].indexOf("/") !== "/"){
                paths[i] = path.resolve(process.cwd(), paths[i]);
            }

            if(exclude){
                paths[i] = "!" + paths[i];
            }

        }

        return grunt.file.expand(paths);

    }

};