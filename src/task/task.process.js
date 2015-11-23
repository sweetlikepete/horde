

/* ------------------------------------------------------------------------ */
/*
        horde.task.process
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var util = require("./../util/util.js");


/* ------------------------------------------------------------------------ */
/*
        private
*/
/* ------------------------------------------------------------------------ */


var defaults = {
    processors : [
        "lint",
        "compile",
        "minify",
        "bundle"
    ]
};

var processors = {
    compile : require("./compile/compile.js"),
    minify : require("./minify/minify.js"),
    bundle : require("./bundle/bundle.js"),
    lint : require("./lint/lint.js")
};


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {


    /* ------------------------------------------------------------------- */
    /*
            methods
    */
    /* ------------------------------------------------------------------- */


    file : function(file, procs){

        return new Promise(function(resolve, reject){

            procs = procs || defaults.processors;

            if(typeof(procs) === "string"){
                procs = [procs];
            }

            var next = function(index){

                index = index || 0;

                var processor = procs[index];
                var errors = [];

                var done = function(){

                    if(index !== procs.length){

                        if(!errors.length){

                            resolve();

                        }else{

                            reject(errors);

                        }

                    }else{

                        next(index += 1);

                    }

                };

                util.promise()
                .then(function(){

                    return processors[processor].file(file, file.options[processor]);

                })
                .then(
                    function(){

                        done();

                    },
                    function(err){

                        errors.push(err);

                        done();

                    }
                )
                .catch(util.log.error);

            };

            next();

        });

    },

    folders : function(config, procs){

        procs = procs || defaults.processors;

        if(typeof(procs) === "string"){
            procs = [procs];
        }

        var self = this;

        var files = util.process.expand(config);

        return new Promise(function(resolve, reject){

            var calls = [];

            for(var i = 0; i < procs.length; i++){

                for(var j = 0; j < files.length; j++){

                    calls.push([files[j], procs[i]]);

                }

            }

            var errors = [];

            var next = function(index){

                if(index !== calls.length){

                    index = index || 0;

                    self.file.apply(self, calls[index]).then(function(){

                        next(index += 1);

                    }, function(errs){

                        errors = errors.concat(errs);

                        next(index += 1);

                    });

                }else{

                    if(!errors.length){

                        resolve();

                    }else{

                        reject(errors);

                    }

                }

            };

            next();

        });

    }


};
