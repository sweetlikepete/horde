

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

        var exec = require("child_process").execSync;

        // get the pids of any currently running gae local server
        var localPorts = exec("lsof -P | grep 'TCP localhost:{0}' | awk '{print $2}'".format(args.port)).toString();
        var adminPorts = exec("lsof -P | grep 'TCP localhost:{0}' | awk '{print $2}'".format(args.adminPort)).toString();

        var ports = [].concat(localPorts.split("\n"), adminPorts.split("\n"));

        ports = ports.filter(function(n){
            return n !== "";
        });

        ports = ports.filter(function(n, pos){
            return ports.indexOf(n) === pos;
        });

        // kill them all
        if(ports.length){
            util.execSync("kill -9 {0}".format(ports.join(" ")));
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

            var proc = child.spawn("appcfg.py", [
                "update",
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
