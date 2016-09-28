

/* ------------------------------------------------------------------------ */
/*
        horde.task.lint.js
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var util = require("./../../util/util.js");


/* ------------------------------------------------------------------------ */
/*
        private
*/
/* ------------------------------------------------------------------------ */


var linter = function(file, options){

    var jshint = require("jshint").JSHINT;
    var grunt = require("grunt");
    var path = require("path");
    var fs = require("fs");

    var task = "lint.jshint";
    var ext = path.extname(file).replace(/\./g, "").toLowerCase();

    options = util.extend({}, options);
    options.config = options.config || path.join(__dirname, "config/jshint.json");
    options.config = JSON.parse(fs.readFileSync(options.config, "utf8"));
    options.rules = options.lint || {};
    options.rules = util.extend(options.config, options.rules);

    if(ext === "es"){
        options.rules["esnext"] = true;
    }

    return new Promise(function(resolve, reject){

        if(util.cache.cached(file, ext, task)){
            return resolve(file);
        }

        var code = fs.readFileSync(file, "utf8");
        var errors = [];

        jshint(code, options.rules);

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

        util.cache.clear(ext, task, file);

        util.validate.code(file, errors, "{0}.{1}".format(ext, task)).then(function(){

            util.log.ok("{0} : lint free : {1}".format(
                "{0}.{1}".format(ext, task).cyan,
                util.path.shorten(file).grey
            ));

            util.cache.set(file, ext, task);

            resolve(file);

        }, reject);

    });

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


    file : function(file, options){

        return new Promise(function(resolve, reject){

            linter(file.path, options)
            .then(resolve, reject)
            .catch(util.log.error);

        });

    }

};
