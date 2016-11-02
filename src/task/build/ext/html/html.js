

/* ------------------------------------------------------------------------ */
/*
        horde.task.build.ext.html.js
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var util = require("./../../../../util/util.js");


/* ------------------------------------------------------------------------ */
/*
        private
*/
/* ------------------------------------------------------------------------ */


var minify = function(code, options){

    var fs = require("fs");
    var path = require("path");

    options = util.extend({}, options);
    options.config = options.config || path.join(__dirname, "../../../../config/htmlmin.json");
    options.config = JSON.parse(fs.readFileSync(options.config, "utf8"));

    var minify = require("html-minifier").minify;
    var result = minify(code, options.config);

    return result;

};

var output = function(file){

    var path = require("path");

    return path.join(file.build, file.dest, path.relative(file.cwd, file.path));

};

var process = function(code, file){

    var grunt = require("grunt");
    var path = require("path");
    var fs = require("fs");

    var resolvePath = function(p){

        var matched = false;

        for(var key in file.folders){

            var folder = file.folders[key];

            if(p.indexOf("/" + folder.dest + "/") === 0){
                p = path.join(file.build, p);
                matched = true;
            }

        }

        if(!matched){
            p = path.join(file.source, p);
        }

        return p;

    };

    var tagsRE = /\<\!\-\-[ \t]{%[ \t]*inline[^\}]*?%}[ \t]\-\-\>[\s\S]*?<\!\-\-[ \t]{%[ \t]*endinline[ \t]*%}[ \t]\-\-\>/g;
    var tags = code.match(tagsRE);

    var compressions = [];

    if(tags){

        for(var i = 0; i < tags.length; i++){

            var tagPartsRE = /\<\!\-\-[ \t]{%[ \t]*inline[^\}]*?%}[ \t]\-\-\>([\s\S]*?)<\!\-\-[ \t]{%[ \t]*endinline[ \t]*%}[ \t]\-\-\>/g
            var includesRE = /<(script|link).*?(href|src)=['"](.*?)['"].*?>/g;
            var tagParts = tagPartsRE.exec(tags[i]);
            var includes = tagParts[1].match(includesRE) || [];

            var files = {
                scripts : [],
                styles : []
            };

            for(var j = 0; j < includes.length; j++){

                var includeRE = /<(script|link).*?(href|src)=['"](.*?)['"].*?>/g;
                var include = includeRE.exec(includes[j]);

                files[include[1] === "script" ? "scripts" : "styles"].push(resolvePath(include[3]));

            }

            var styleData = "";
            var scriptData = "";

            files.styles.forEach((file) => {
                styleData += grunt.file.read(file);
            });

            files.scripts.forEach((file) => {
                scriptData += grunt.file.read(file);
            });

            if(styleData !== ""){
                styleData = "<style>" + styleData + "</style>";
            }

            if(scriptData !== ""){
                scriptData = scriptData.replace(/(\/\*[\s\S]*?\*\/)|(\n\/\/.*?\n)/g, "");
                scriptData = scriptData.replace(/\n/g, "");
                scriptData = "<scr" + "ipt>" + scriptData + "</sc" + "ript>";
            }

            code = code.replace(tags[i], styleData + scriptData);

        }

    }

    return code;

};


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {

    build : function(file, options){

        return new Promise((resolve, reject) => {

            if(util.cache.cached(file.path, file.ext, "build")){
                return resolve();
            }

            var fs = require("fs");

            var code = fs.readFileSync(file.path, "utf8");

            code = minify(code, options);
            code = process(code, file);

            util.process.write(file.path, output(file), code, file.ext, "build", resolve);

        });

    }

}
