

/* ------------------------------------------------------------------------ */
/*
        tasks.lint.less
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
    "adjoining-classes" : false,
    "box-model" : false,
    "empty-rules" : false,
    "compatible-vendor-prefixes" : false,
    "display-property-grouping" : true,
    "duplicate-background-images" : false,
    "duplicate-properties" : true,
    "fallback-colors" : false,
    "gradients" : false,
    "box-sizing" : false,
    "ids" : false,
    "important" : false,
    "known-properties" : true,
    "outline-none" : false,
    "overqualified-elements" : false,
    "qualified-headings" : false,
    "universal-selector" : false,
    "zero-units" : true,
    "unique-headings" : false
};


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = function(paths, options){

    paths = paths || [];

    options = options || {};
    options.lint = options.less || {};
    options.lint = utils.extend(config, options.lint);

    files = utils.files.expand(paths);
    files = utils.cache.filter(files, "lint", "less");

    return new Promise(function(resolve, reject){

        if(!files || files.length === 0){
            return resolve();
        }

        var csslint = require("csslint").CSSLint;
        var grunt = require("grunt");
        var path = require("path");
        var less = require("less");
        var fs = require("fs");

        var errors = [];

        var processLint = function(files, index){

            index = index || 0;

            if(files[index]){

                var data = fs.readFileSync(files[index], "utf8");

                options.filename = path.join(process.cwd(), files[index]);

                less.render(data, options.less, function(error, output){

                    var next = function(){

                        if(files[index + 1]){

                            processLint(files, index + 1);

                        }else{

                            utils.validate.code(errors, "less", function(){

                                utils.cache.set(files, "lint", "less");

                                resolve();

                            });

                        }

                    };

                    if(error){
                        grunt.fail.fatal(error);
                    }

                    if(output.css !== ""){

                        result = csslint.verify(output.css, options.lint);

                        result.messages.forEach(function(message){

                            errors.push({
                                character : message.col,
                                reason : message.rule.name,
                                line : message.line,
                                file : files[index],
                                description : message.rule.desc,
                                code : output.css
                            });

                        });

                    }

                    next();

                });

            }

        };

        processLint(files);

    });

}
