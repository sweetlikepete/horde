

/* ------------------------------------------------------------------------ */
/*
        horde.task.lint.less
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


var validate = function(css, file, task, ext, options, resolve, reject){

    var csslint = require("csslint").CSSLint;
    var path = require("path");
    var fs = require("fs");

    options = util.extend({}, options);
    options.config = options.config || path.join(__dirname, "config/csslint.json");
    options.config = JSON.parse(fs.readFileSync(options.config, "utf8"));
    options.rules = options.rules || {};
    options.rules = util.extend(options.config, options.rules);

    var errors = [];

    if(css !== ""){

        result = csslint.verify(css, options.rules);

        result.messages.forEach(function(message){

            errors.push({
                character : message.col,
                reason : message.rule.name,
                line : message.line,
                file : file,
                description : message.rule.desc,
                code : css
            });

        });

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

};

var linter = function(file, options){

    var path = require("path");
    var fs = require("fs");

    var task = "lint";
    var ext = path.extname(file).replace(/\./g, "").toLowerCase();

    return new Promise(function(resolve, reject){

        if(util.cache.cached(file, ext, task)){
            return resolve(file);
        }

        options.filename = path.join(process.cwd(), file);

        var data = fs.readFileSync(file, "utf8");

        if(data.match(/\/\*[ \t]*SKIP LINT[ \t]*\*\//g)){
            return resolve();
        }

        switch(ext){

            case "less" :

                var less = require("less");

                less.render(data, options.less, function(error, response){

                    if(error){

                        reject("{0}\n{1}".format(file, error));

                    }else{

                        validate(response.css, file, task, ext, options, resolve, reject);

                    }

                });

            break;

            case "scss" :

                var sass = require("node-sass");

                var opts = JSON.parse(JSON.stringify(options.scss || {}));

                opts.file = file;

                sass.render(opts, function(error, response){

                    if(error){

                        reject("{0}\n{1}".format(file, error));

                    }else{

                        validate(response.css.toString(), file, task, ext, options, resolve, reject);

                    }

                });

            break;

            case "css" :

                var data = fs.readFileSync(file, "utf8");

                validate(data, file, task, ext, options, resolve, reject);

            break;

        }

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
