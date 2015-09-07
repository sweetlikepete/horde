

/* ------------------------------------------------------------------------ */
/*
        tasks.lint.jshint
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var utils = require("./../../utils/utils.js");


/* ------------------------------------------------------------------------ */
/*
        config
*/
/* ------------------------------------------------------------------------ */


var config = {
    "curly" : true,
    "eqeqeq" : true,
    "immed" : true,
    "latedef" : true,
    "newcap" : true,
    "noarg" : true,
    "sub" : true,
    "boss" : true,
    "eqnull" : true,
    "browser" : true
};


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = function(paths, options){

    paths = paths || [];

    options = utils.extend(config, options);

    files = utils.files.expand(paths);
    files = utils.cache.filter(files, "lint", "jshint");

    files = files.filter(function(value){
        var suffix = ".min.js";
        return value.toLowerCase().indexOf(suffix, value.length - suffix.length) === -1;
    });

    return new Promise(function(resolve, reject){

        if(!files || files.length === 0){
            return resolve();
        }

        var jshint = require("jshint").JSHINT;
        var grunt = require("grunt");
        var fs = require("fs");

        var errors = [];

        files.forEach(function(file){

            var code = fs.readFileSync(file, "utf8");

            jshint(code, options);

            for(var j = 0; j < jshint.errors.length; j++){

                if(jshint.errors[j] !== null){

                    errors.push({
                        character : jshint.errors[j].character,
                        reason : jshint.errors[j].reason,
                        line : jshint.errors[j].line,
                        description : "",
                        file : file,
                        code : code
                    });

                }

            }

        });

        if(utils.validate.code(errors, "jshint")){
            utils.cache.set(files, "lint", "jshint");
        }

        resolve();

    });

}
