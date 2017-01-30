

/* ------------------------------------------------------------------------ */
/*
        horde.task.build.ext.json.js
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

    return new Promise(function(resolve, reject){

        var grunt = require("grunt");
        var path = require("path");
        var fs = require("fs");
        var im = require("node-imagemagick");
        var Datauri = require("datauri");

        var tagsRE = /<%[ \t]*base64image[ \t]*[^\>]*?%\>[\s\S]*?<%[ \t]*endbase64image[ \t]*%\>/g;
        var tags = code.match(tagsRE);

        var compressions = [];

        if(tags){

            for(var i = 0; i < tags.length; i++){

                var tagPartsRE = /<%[ \t]*base64image[ \t]*[^\>]*?%\>([\s\S]*?)<%[ \t]*endbase64image[ \t]*%\>/g
                var tagParts = tagPartsRE.exec(tags[i]);
                var imageFile = resolvePath(tagParts[1], file);
                var size = 15;

                im.resize({
                    srcData : fs.readFileSync(imageFile, "binary"),
                    width : size
                }, function(err, stdout, stderr){

                    if(err){
                        reject(err);
                    }

                    var datauri = new Datauri();

                    datauri.format(".png", new Buffer(stdout, "binary"));

                    code = code.replace(tagParts[0], datauri.content);

                    resolve(code);

                });

            }

        }else{

            resolve(code);

        }

    });

};



/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {

    build : function(file, options){

        var fs = require("fs");

        return new Promise(function(resolve, reject){

            if(util.cache.cached(file.path, file.ext, "build")){

                return resolve();

            }else{

                var code = fs.readFileSync(file.path, "utf8");

                processInlines(code, file).then(function(processedCode){
                    util.process.write(file.path, output(file), processedCode, file.ext, "build", resolve);
                }, function(err){
                    reject(err);
                });

            }

        });

    }

}
