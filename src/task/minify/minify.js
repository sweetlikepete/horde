

/* ------------------------------------------------------------------------ */
/*
        horde.task.minify
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
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {


    /* -------------------------------------------------------------------- */
    /*
            sub-modules
    */
    /* -------------------------------------------------------------------- */


    exts : {

        js : require("./minify.js.js"),

        coffee : require("./minify.js.js"),

        es : require("./minify.js.js"),

        css : require("./minify.css.js"),

        less : require("./minify.css.js"),

        scss : require("./minify.css.js"),

        jpg : require("./minify.image.js"),

        jpeg : require("./minify.image.js"),

        png : require("./minify.image.js"),

        gif : require("./minify.image.js")

    },


    /* -------------------------------------------------------------------- */
    /*
            functions
    */
    /* -------------------------------------------------------------------- */


    output : function(){

        return util.process.output.apply(this, arguments);

    },

    file : function(){

        return util.process.file.apply(this, arguments);

    }


};
