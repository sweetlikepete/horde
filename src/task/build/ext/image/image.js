

/* ------------------------------------------------------------------------ */
/*
        horde.task.build.ext.image.js
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var util = require("./../../../../util/util.js");
var lint = require("./../../../lint/lint.js.js")


/* ------------------------------------------------------------------------ */
/*
        private
*/
/* ------------------------------------------------------------------------ */


var output = function(file){

    var path = require("path");

    return path.join(file.build, file.dest, path.relative(file.cwd, file.path));

};



/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {

    build : function(file, options){

        return new Promise(function(resolve, reject){

            util.process.copy(file.path, output(file), "image", "build", resolve);

        });

    }

}
