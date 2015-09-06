

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

    code : function(errors, type, callback){

        var grunt = require("grunt");

        if(!errors){
            return false;
        }

        if(!errors.length){

            console.log("No {0} code style errors found.".format(type));

            return typeof callback === "function" ? callback() : true;

        }

        var table = require("text-table");

        errors.forEach(function(error){

            var line = error.line;
            var lines = error.code.split("\n");

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

            var data = [];

            prints.pre.forEach(function(text, index){

                var li = line - (prints.pre.length - index);

                if(li >= 0){
                    data.push(["{0} | ".format(li)["grey"], " {0}".format(text)["white"]]);
                }

            });

            data.push(["{0} | ".format(line)["grey"], " {0}".format(lines[line - 1]["red"])]);
            data.push(["---------"["grey"], (new Array(error.character - 1).join("-") + "^")["grey"]]);

            prints.post.forEach(function(text, index){
                data.push(["{0} | ".format(line + (index + 1))["grey"], " {0}".format(text)["white"]]);
            });

            console.log("");
            console.log(error.reason["white"].bold + " " + error.file["green"] + " :");

            if(error.description){
                console.log(error.description["grey"]);
            }

            console.log(table(data, { align : ["r", "l"], hsep : "" }));

        });

        console.log("");

        grunt.fail.fatal("{1} {2} code style {0} found.".format(
            grunt.util.pluralize(errors, "errors/error"),
            errors.length,
            type
        ));

        return false;

    }

};
