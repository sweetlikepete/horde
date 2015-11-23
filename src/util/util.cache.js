

/* ------------------------------------------------------------------------ */
/*
        util.cache
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var path = require("path");
var grunt = require("grunt");
var fs = require("fs");

var log = require("./util.log.js");


/* ------------------------------------------------------------------------ */
/*
        config
*/
/* ------------------------------------------------------------------------ */


var config = {
    path : path.resolve(__dirname, "../.temp/cache.json"),
    key : "horde_cache"
};


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {


    /* -------------------------------------------------------------------- */
    /*
            function shortcuts
    */
    /* -------------------------------------------------------------------- */


    get : function(extension, task){

        cache = this.getAll();

        cache[extension] = cache[extension] || {};
        cache[extension][task] = cache[extension][task] || {};

        return cache[extension][task];

    },

    getAll : function(){

        if(grunt.config(config.key)){
            return grunt.config(config.key);
        }

        var cache = {};
        var data = "{}";

        try{
            data = fs.readFileSync(config.path, "utf8");
        }catch(e){}

        try{
            cache = JSON.parse(data);
        }catch(e){}

        grunt.config(config.key, cache);

        return cache;

    },

    set : function(files, extension, task){

        var cache = this.getAll();
        var self = this;

        if(typeof(files) === "string"){
            files = [files];
        }

        cache[extension] = cache[extension] || {};

        if(typeof(task) === "string" && task.length > 0){

            cache[extension][task] = cache[extension][task] || {};

            if(typeof(files) === "string"){
                files = [files];
            }

            files.forEach(function(file){

                if(fs.existsSync(file)){
                    cache[extension][task][file] = self.hashFile(file);
                }

            });

        }

        this.setAll(cache);

    },

    clear : function(extensions, tasks, files){

        var self = this;

        var cache = this.getAll();

        if(
            extensions && typeof(extensions) === "string" &&
            tasks && typeof(tasks) === "string" &&
            files
        ){

            if(typeof(files) === "string"){
                files = [files];
            }

            cache[extensions] = cache[extensions] || {};
            cache[extensions][tasks] = cache[extensions][tasks] || {};

            files.forEach(function(file){
                delete cache[extensions][tasks][file];
            });

        }else if(
            extensions && typeof(extensions) === "string" &&
            tasks
        ){

            if(typeof(tasks) === "string"){
                tasks = [tasks];
            }

            cache[extensions] = cache[extensions] || {};

            tasks.forEach(function(task){
                delete cache[extensions][task];
            });

        }else if(extensions){

            if(typeof(extensions) === "string"){
                extensions = [extensions];
            }

            extensions.forEach(function(extension){
                delete cache[extension];
            });

        }

        this.setAll(cache);

    },

    setAll : function(cache){

        var jsonfile = require("jsonfile");

        grunt.config(config.key, cache);

        grunt.file.mkdir(path.dirname(config.path));

        jsonfile.writeFileSync(config.path, cache);

    },

    filter : function(files, extension, task){

        if(!files || !files.length){
            return null;
        }

        var cache = this.get(extension, task);

        var tag = ("{0}.{1}".format(extension, task)).cyan;
        var selects = [];
        var self = this;

        files.forEach(function(file){

            if(cache[file] !== self.hashFile(file)){
                selects.push(file);
            }

        });

        var formatCount = function(num){
            return "{0} {1}".format(num, grunt.util.pluralize(num, "file/files"));
        };

        log.ok("{0} : {1} {2}".format(tag, formatCount(files.length), "scanned"));

        if(selects.length !== files.length){

            log.ok("{0} : {1} {2}".format(tag, formatCount(files.length - selects.length), "skipped"));

        }

        selects = selects.length === 0 ? null : selects;

        return selects;

    },

    cached : function(file, extension, task){

        if(this.get(extension, task)[file] !== this.hashFile(file)){
            return false;
        }

        return true;

    },

    hashFile : function(file){

        var crypto = require("crypto");

        var checksum = function(str){
            return crypto.createHash("sha1").update(str, "utf8").digest("hex");
        };

        if(!fs.existsSync(file) || fs.lstatSync(file).isDirectory()){
            return null;
        }

        var data = fs.readFileSync(file);

        return checksum(data);

    },

    clean : function(){

        var self = this;

        return new Promise(function(resolve, reject){

            var cache = self.getAll();

            if(fs.existsSync(config.path)){
                fs.unlinkSync(config.path);
            }

            self.setAll({
                prompt : cache.prompt
            });

            resolve();

        });

    }

};