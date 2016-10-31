

/* ------------------------------------------------------------------------ */
/*
        task
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {

    bower : require("./task.bower.js"),

    build : require("./build/build.js"),

    bundle : require("./bundle/bundle.js"),

    clean : require("./task.clean.js"),

    compile : require("./compile/compile.js"),

    display : require("./task.display.js"),

    gae : require("./task.gae.js"),

    lint : require("./lint/lint.js"),

    minify : require("./minify/minify.js"),

    modernizr : require("./task.modernizr.js"),

    open : require("./task.open.js"),

    process : require("./task.process.js"),

    prompt : require("./task.prompt.js"),

    replace : require("./task.replace.js"),

    settings : require("./task.settings.js"),

    watch : require("./task.watch.js")

};
