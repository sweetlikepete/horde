

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

            var proc = child.spawn("appcfg.py", [
                "rollback",
                args.path
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

    }

};
