

/* ------------------------------------------------------------------------ */
/*
        tasks.gae
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var utils = require("./../utils/utils.js");


/* ------------------------------------------------------------------------ */
/*
        private
*/
/* ------------------------------------------------------------------------ */


var interval = null;


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

        return new Promise(function(resolve, reject){

            var path = require("path");

            args = utils.extend({
                host : "localhost",
                path : "",
                port : 8000,
                open : true
            }, args);

            if(!args.adminPort){
                args.adminPort = args.port + 1;
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
                utils.execSync("kill -9 {0}".format(ports.join(" ")));
            }

            // run the server
            utils.execSync([
                "dev_appserver.py",
                "--port={0}".format(args.port),
                "--admin_port={0}".format(args.adminPort),
                "--enable_sendmail=yes",
                args.path
            ].join(" "));

            resolve();

        });

    },

    update : function(args){

        return new Promise(function(resolve, reject){

            // deploy the application
            utils.execSync([
                "appcfg.py",
                "update",
                args.path
            ].join(" "));

            resolve();

        });

    }

}