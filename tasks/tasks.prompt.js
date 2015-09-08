

/* ------------------------------------------------------------------------ */
/*
        tasks.prompt
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var utils = require("./../utils/utils.js");


/* ------------------------------------------------------------------------ */
/*
        presets
*/
/* ------------------------------------------------------------------------ */


var presets = {
    environment : [
        { name : "Local", value : "dev" },
        { name : "Stage", value : "stage" },
        { name : "Live", value : "live" }
    ],
    application : [
        { name : "Frontend", value : "frontend" },
        { name : "Backend", value : "backend" }
    ]
};


/* -------------------------------------------------------------------- */
/*
        private
*/
/* -------------------------------------------------------------------- */


var getDefault = function(prompt){

    var hist = utils.cache.getAll().prompt || {};
    var def = hist[prompt.id];

    for(var i = 0; i < prompt.choices.length; i++){
        if(prompt.choices[i].value === def){
            return def;
        }
    }

    return null;

};

var runPrompt = function(args){

    var inquirer = require("inquirer");
    var grunt = require("grunt");

    args = args || {};

    if(
        grunt.config.data.prompt &&
        grunt.config.data.prompt[args.id]
    ){

        args.callback(grunt.config.data.prompt[args.id]);

    }else{

        grunt.config("prompt", grunt.config("prompt") || {});

        var cache = utils.cache.getAll();

        cache.prompt = cache.prompt || {};

        if(typeof args.choices === "function"){
            args.choices = args.choices();
        }

        inquirer.prompt([
            {
                message : "Select {0}:".format(args.label),
                name : args.id,
                type : "list",
                default : getDefault(args),
                choices : args.choices
            }
        ], function(answers){

            grunt.config("prompt." + args.id, answers[args.id]);

            cache.prompt[args.id] = answers[args.id];

            utils.cache.setAll(cache);

            args.callback(answers[args.id]);

        });

    }

};


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {

    get : function(prompts, useHistory){

        return new Promise(function(resolve, reject){

            var cache = utils.cache.getAll();

            if(typeof prompts === "string"){
                prompts = [prompts];
            }

            var completed = 0;
            var data = {};

            var processPrompts = function(prompts, index){

                index = index || 0;

                var prmpt = prompts[index];

                if(typeof prmpt === "string"){

                    prmpt = {
                        id : prmpt,
                        label : prmpt,
                        choices : presets[prmpt]
                    };

                }

                var cb = function(response){

                    data[prmpt.id] = response;

                    completed++;

                    if(index !== prompts.length - 1){

                        processPrompts(prompts, index + 1);

                    }else{

                        console.log("wtf");

                        resolve(data);

                    }

                };

                if(
                    useHistory &&
                    cache.prompt &&
                    cache.prompt[prmpt.id]
                ){

                    var val = cache.prompt[prmpt.id];

                    for(var i = 0; i < prmpt.choices.length; i++){
                        if(prmpt.choices[i].value ===  cache.prompt[prmpt.id]){
                            val = prmpt.choices[i].name;
                        }
                    }

                    console.log("{0} {1} {2}".format(
                        "?"["green"],
                        "Select {0}:".format(prmpt.id)["white"].bold,
                        val["cyan"]
                    ));

                    return cb(cache.prompt[prmpt.id]);

                }

                runPrompt({
                    id : prmpt.id,
                    label : prmpt.label || prmpt.id,
                    callback : cb,
                    choices : prmpt.choices
                });

            };

            processPrompts(prompts);

        });

    }

}