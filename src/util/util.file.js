

/* ------------------------------------------------------------------------ */
/*
        horde.util.file
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var util = {
    path : require("./util.path.js"),
    log : require("./util.log.js"),
    extend : require("node.extend")
};


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


    expand : function(paths, extension){

        var grunt = require("grunt");
        var fs = require("fs");

        if(typeof paths === "string"){
            paths = [paths];
        }

        paths = paths.slice(0);

        if(extension){

            extension = extension.replace(/\.\./g, ".").replace(/^\./, "");

            paths.forEach(function(path, index){

                if(
                    !fs.existsSync(path) ||
                    fs.lstatSync(path).isDirectory()
                ){

                    paths[index] = paths[index].replace(/\/[a-zA-Z\*]*?\.[a-zA-Z\*]*?$/, "");
                    paths[index] = paths[index].replace(/\/\*\*$/, "");

                    if(path.indexOf("!") === -1){
                        paths[index] = paths[index] + "/**/*." + extension;
                    }else{
                        paths[index] = paths[index] + "/**";
                    }

                }

            });

        }

        var files = grunt.file.expand(paths);

        if(extension && extension.indexOf("*") === -1){

            files = files.filter(function(file){

                var ext = "." + extension.toLowerCase();

                file = file.toLowerCase();

                if(file.indexOf(ext, file.length - ext.length) !== -1){
                    return true;
                }

                return false;

            });

        }

        return files;

    }

};