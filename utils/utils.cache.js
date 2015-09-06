

/* ------------------------------------------------------------------------ */
/*
        utils.cache
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


/* ------------------------------------------------------------------------ */
/*
        config
*/
/* ------------------------------------------------------------------------ */


var config = {
    key : "horde_cache",
    path : path.resolve(__dirname, "../temp/cache.json")
};


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {

    get : function(task, method){

        cache = this.getAll();

        cache[task] = cache[task] || {};
        cache[task][method] = cache[task][method] || {};

        return cache[task][method];

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

    set : function(files, task, method){

        var cache = this.getAll();

        cache[task] = cache[task] || {};
        cache[task][method] = cache[task][method] || {};

        for(var i = 0; i < files.length; i++){
            cache[task][method][files[i]] = this.hashFile(files[i]);
        }

        this.setAll(cache);

    },

    setAll : function(cache){

        var jsonfile = require("jsonfile");

        grunt.config(config.key, cache);

        grunt.file.mkdir(path.dirname(config.path));

        jsonfile.writeFileSync(config.path, cache);

    },

    filter : function(files, task, method){

        if(!files || !files.length){
            return null;
        }

        var cache = this.get(task, method);

        var tag = ("{0}.{1}".format(task, method))["cyan"];
        var selects = [];

        for(var i = 0; i < files.length; i++){

            if(cache[files[i]] !== this.hashFile(files[i])){
                selects.push(files[i]);
            }

        }

        grunt.log.ok(tag + " : " + (String(files.length) + " files")["green"] + " found");

        if(selects.length !== files.length){

            grunt.log.ok(tag + " : " + (String(files.length - selects.length) + " files")["green"] + " skipped");

        }

        selects = selects.length === 0 ? null : selects;

        return selects;

    },

    hashFile : function(file){

        var crypto = require("crypto");

        var checksum = function(str){
            return crypto.createHash("sha1").update(str, "utf8").digest("hex");
        };

        var data = fs.readFileSync(file);

        return checksum(data);

    },

    clean : function(){

        var cache = this.getAll();

        if(fs.existsSync(config.path)){
            fs.unlinkSync(config.path);
        }

        this.setAll({
            prompt : cache.prompt
        });

    }

};