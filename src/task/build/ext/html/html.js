

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

var resolvePath = function(p, file){

    var path = require("path");
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

var processInlines = function(code, file){

    var grunt = require("grunt");
    var path = require("path");
    var fs = require("fs");

    var tagsRE = /\<\!\-\-[ \t]\<%[ \t]*inline[^\}]*?%\>[ \t]\-\-\>[\s\S]*?<\!\-\-[ \t]\<%[ \t]*endinline[ \t]*%\>[ \t]\-\-\>/g;
    var tags = code.match(tagsRE);

    var compressions = [];

    if(tags){

        for(var i = 0; i < tags.length; i++){

            var tagPartsRE = /\<\!\-\-[ \t]\<%[ \t]*inline[^\}]*?%\>[ \t]\-\-\>([\s\S]*?)<\!\-\-[ \t]\<%[ \t]*endinline[ \t]*%\>[ \t]\-\-\>/g
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

                files[include[1] === "script" ? "scripts" : "styles"].push(resolvePath(include[3], file));

            }

            var styleData = "";
            var scriptData = "";

            files.styles.forEach((file) => {
                styleData += grunt.file.read(file);
            });

            files.scripts.forEach((file) => {

                var UglifyJS = require("uglify-js");
                var jsCode = grunt.file.read(file);

                if(file.match(/.*\.js$/)){

                    jsCode = UglifyJS.minify(jsCode, {
                        fromString : true
                    }).code;

                }

                scriptData += "<scr" + "ipt>" + jsCode + "</sc" + "ript>";

            });

            if(styleData !== ""){
                styleData = "<style>" + styleData + "</style>";
            }

            // code = code.replace(tags[i], styleData + scriptData);
            code = code.replace(tags[i], "DILDOSWAGGINSISMYHERO");
            code = code.split("DILDOSWAGGINSISMYHERO").join(styleData + scriptData);

        }

    }

    return code;

};

var antiCache = function(code, file, options){

    var refRE = /<(link|source|img).*?(href|src)=["'](.*?)["']>/g;
    var refs = code.match(refRE);
    var path = require("path");
    var md5File = require("md5-file");
    var sh = require("shorthash");

    if(refs){

        for(var i = 0; i < refs.length; i++){

            var refPartsRE = /<(link|source|img).*?(href|src)=["'](.*?)["'].*?>/g
            var refParts = refPartsRE.exec(refs[i]);
            var refPath = refParts[3];

            for(var j = 0; j < options.html.antiCache.length; j++){

                var m = options.html.antiCache[j];

                if(refPath.indexOf(m.path) === 0){

                    var hash = sh.unique(md5File.sync(path.join(m.rel, refPath)));
                    var busted = refs[i].replace(refPath, refPath + "?v=" + hash);

                    code = code.replace(refs[i], busted);

                    break;

                }

            }

        }

    }

    return code;

};

var configurePush = function(code){

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

            code = processInlines(code, file);

            /*if(options.html && options.html.antiCache){
                code = antiCache(code, file, options);
            }*/

            code = minify(code, options);

            util.process.write(file.path, output(file), code, file.ext, "build", resolve);

        });

    }

}
