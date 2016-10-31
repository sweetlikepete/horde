

/* ------------------------------------------------------------------------ */
/*
        horde.task.build.lint.css
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var util = require("./../../../../util/util.js");


/* ------------------------------------------------------------------------ */
/*
        private
*/
/* ------------------------------------------------------------------------ */

module.exports = {


    /* -------------------------------------------------------------------- */
    /*
            functions
    */
    /* -------------------------------------------------------------------- */


    lint : function(file, data, options){

        return new Promise(function(resolve, reject){

            if(data.match(/\/\*[ \t]*SKIP LINT[ \t]*\*\//g)){
                return resolve();
            }

            var csslint = require("csslint").CSSLint;
            var path = require("path");
            var fs = require("fs");

            options = util.extend({}, options);
            options.config = options.config || path.join(__dirname, "../../../../config/csslint.json");
            options.config = JSON.parse(fs.readFileSync(options.config, "utf8"));
            options.rules = options.rules || {};
            options.rules = util.extend(options.config, options.rules);

            var errors = [];

            if(data !== ""){

                result = csslint.verify(data, options.rules);

                result.messages.forEach(function(message){

                    errors.push({
                        character : message.col,
                        reason : message.rule.name,
                        line : message.line,
                        file : file.path,
                        description : message.rule.desc,
                        code : data
                    });

                });

            }

            util.validate.code(file.path, errors, "{0}.{1}".format(file.ext, "lint")).then(function(){

                util.log.ok("{0} : lint free : {1}".format(
                    "{0}.{1}".format(file.ext, "lint").cyan,
                    util.path.shorten(file.path).grey
                ));

                resolve(file);

            }, reject);

        });

    }

};
