

/* ------------------------------------------------------------------------ */
/*
        tasks
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {

    bower : require("./tasks.bower.js"),

    clean : require("./tasks.clean.js"),

    compile : require("./compile/compile.js"),

    compress : require("./tasks.compress.js"),

    display : require("./tasks.display.js"),

    images : require("./images/images.js"),

    lint : require("./lint/lint.js"),

    minify : require("./minify/minify.js")

};