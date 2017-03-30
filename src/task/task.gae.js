

/* ------------------------------------------------------------------------ */
/*
        horde.task.gae
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var util = require("./../util/util.js");
var grunt = require("grunt");


/* ------------------------------------------------------------------------ */
/*
        private
*/
/* ------------------------------------------------------------------------ */


var output = function(data){

    data = String(data).split("\n");
    data = data.filter(function(d){
        return d !== "";
    });

    data.forEach(function(d, index){
        data[index] = "{0} : {1}".format("gae.log".cyan, String(d).replace(/[ \t\n]+$/g, "").grey);
    });

    data = data.join("\n");

    util.log.ok(String(data));

};


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = {


    /* -------------------------------------------------------------------- */
    /*
            functions
    */
    /* -------------------------------------------------------------------- */


    start : function(args){

        var child = require("child_process");
        var path = require("path");
        var fs = require("fs");

        args = util.extend({
            host : "localhost",
            path : "",
            port : 8000,
            open : true
        }, args);

        if(!args.adminPort){
            args.adminPort = args.port + 1;
        }

        if(!args.apiPort){
            args.apiPort = args.adminPort + 1;
        }

        util.execSync("lsof -P | grep ':{0}' | awk '{print $2}' | xargs kill -9".format(args.port));
        util.execSync("lsof -P | grep ':{0}' | awk '{print $2}' | xargs kill -9".format(args.adminPort));

        if(fs.existsSync(path.join(args.path, "app.local.yaml"))){
            args.path = path.join(args.path, "app.local.yaml");
        }

        var proc = child.spawn("dev_appserver.py", [
            "--port={0}".format(args.port),
            "--admin_port={0}".format(args.adminPort),
            "--api_port={0}".format(args.apiPort),
            "--clear_datastore={0}".format(args.clear ? "yes" : "no"),
            "--enable_sendmail=yes",
            "--skip_sdk_update_check=yes",
            args.path
        ]);

        proc.stdout.on("data", output);
        proc.stderr.on("data", output);

        return "http://localhost:{0}".format(args.port);

    },

    update : function(){

        return new Promise(function(resolve, reject){

            var child = require("child_process");

            var proc = child.spawn("gcloud", [
                "components",
                "update"
            ]);

            proc.stderr.on("data", output);

            proc.stderr.on("close", function(code){

                if(code instanceof Error){
                    reject(code);
                }else{
                    resolve();
                }

            });

        });

    },

    deploy : function(args){

        return new Promise(function(resolve, reject){

            var child = require("child_process");
            var proc;

            if(args.id){

                proc = child.spawn("appcfg.py", [
                    "-A",
                    args.id,
                    "update",
                    args.path
                ]);

            }else{

                proc = child.spawn("appcfg.py", [
                    "update",
                    args.path
                ]);

            }

            proc.stderr.on("data", output);

            proc.stderr.on("close", function(code){

                if(code instanceof Error){
                    reject(code);
                }else{
                    resolve();
                }

            });

        });

    },

    rollback : function(args){

        return new Promise(function(resolve, reject){

            var child = require("child_process");
            var proc;

            if(args.id){

                proc = child.spawn("appcfg.py", [
                    "-A",
                    args.id,
                    "rollback",
                    args.path
                ]);

            }else{

                proc = child.spawn("appcfg.py", [
                    "rollback",
                    args.path
                ]);

            }

            proc.stderr.on("data", output);

            proc.stderr.on("close", function(code){

                if(code instanceof Error){
                    reject(code);
                }else{
                    resolve();
                }

            });

        });

    },

    sync : function(args){

        var child = require("child_process");
        var fs = require("fs");

        var download = function(callback){

            var next = function(index){

                index = index || 0;

                if(index < args.models.length){

                    var model = args.models[index];

                    var filename = "data/{0}.sqlite".format(model);
                    var dbName = "data/db/{0}.sql3".format(model);
                    var dbResultsName = "data/db/{0}.results.sql3".format(model);
                    var logName = "data/log/{0}.log".format(model);

                    if(fs.existsSync(filename)){ grunt.file.delete(filename); }
                    if(fs.existsSync(dbName)){ grunt.file.delete(dbName); }
                    if(fs.existsSync(dbResultsName)){ grunt.file.delete(dbResultsName); }
                    if(fs.existsSync(logName)){ grunt.file.delete(logName); }

                    grunt.file.mkdir("data/log");
                    grunt.file.mkdir("data/db");

                    var flags = [
                        "--url={0}/_ah/remote_api".format(args.production),
                        "-A",
                        args.id,
                        "--filename={0}".format(filename),
                        "--db_filename={0}".format(dbName),
                        "--result_db_filename={0}".format(dbResultsName),
                        "--log_file={0}".format(logName),
                        "--kind={0}".format(model),
                        "download_data"
                    ];

                    var proc = child.spawn("appcfg.py", flags);

                    proc.stderr.on("data", output);

                    proc.stderr.on("close", function(code){

                        if(code instanceof Error){
                            callback(code);
                        }else{
                            next(index + 1);
                        }

                    });

                }else{

                    callback();

                }

            };

            next();

        };

        var upload = function(callback){

            var next = function(index){

                index = index || 0;

                if(index < args.models.length){

                    var model = args.models[index];

                    var filename = "data/{0}.sqlite".format(model);
                    var dbName = "data/db/{0}.progress.sql3".format(model);
                    var logName = "data/log/{0}.upload.log".format(model);

                    if(fs.existsSync(dbName)){ grunt.file.delete(dbName); }
                    if(fs.existsSync(logName)){ grunt.file.delete(logName); }

                    grunt.file.mkdir("data/log");
                    grunt.file.mkdir("data/db");

                    var flags = [
                        "--url={0}/_ah/remote_api".format(args.local),
                        "-A",
                        args.id,
                        "--filename={0}".format(filename),
                        "--db_filename={0}".format(dbName),
                        "--log_file={0}".format(logName),
                        "--num_threads=1",
                        "upload_data"
                    ];

                    console.log(flags.join(" "));

                    var proc = child.spawn("appcfg.py", flags);

                    proc.stderr.on("data", output);

                    proc.stderr.on("close", function(code){

                        if(code instanceof Error){
                            callback(code);
                        }else{
                            next(index + 1);
                        }

                    });

                }else{

                    callback();

                }

            };

            next();

        };

        return new Promise(function(resolve, reject){

            download(function(downloadError){

                if(downloadError){

                    reject(downloadError);

                }else{

                    upload(function(uploadError){

                        if(uploadError){

                            reject(uploadError);

                        }else{

                            resolve();

                        }

                    });

                }

            });

        });

    }

};
