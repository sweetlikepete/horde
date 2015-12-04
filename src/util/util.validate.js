

/* ------------------------------------------------------------------------ */
/*
        horde.util.validate
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var log = require("./util.log.js");


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


    code : function(file, errors, type){

        var grunt = require("grunt");

        return new Promise(function(resolve, reject){

            if(!errors || !errors.length){
                resolve();
            }

            var table = require("text-table");
            var messages = [];

            errors.forEach(function(error){

                var data = [];

                if(error.code !== ""){

                    var line = error.line || 1;
                    var lines = error.code.split("\n");

                    error.character = error.character || 1;

                    var prints = {
                        line : lines[line - 1],
                        post : [
                            (lines[line] ? lines[line] : ""),
                            (lines[line + 1] ? lines[line + 1] : "")
                        ],
                        pre : [
                            (lines[line - 3] ? lines[line - 3] : ""),
                            (lines[line - 2] ? lines[line - 2] : "")
                        ]
                    };

                    prints.pre.forEach(function(text, index){

                        var li = line - (prints.pre.length - index);

                        if(li >= 0){
                            data.push(["{0} | ".format(li)["grey"], " {0}".format(text).white]);
                        }

                    });

                    var lineText = lines[line - 1];
                    lineText = lineText !== "" ? lineText.red : lineText;

                    data.push(["{0} | ".format(line).grey, " {0}".format(lineText)]);

                    data.push(["---------"["grey"], (new Array((error.character) - 1).join("-") + "^")["grey"]]);

                    prints.post.forEach(function(text, index){
                        data.push(["{0} | ".format(line + (index + 1))["grey"], " {0}".format(text)["white"]]);
                    });

                }

                message = "";
                message += "\n" + error.reason["white"].bold + " " + error.file.green + " :";

                if(error.description){
                    message += "\n" + error.description["grey"];
                }

                if(data.length){
                    message += "\n" + table(data, { align : ["r", "l"], hsep : "" });
                }

                message += "\n";

                messages.push(message);

                log.raw(message);

            });

            reject(messages);

        });

    }

};
