
var utils = require("./../utils/utils.js");
var expand = require("glob-expand");

module.exports = {

    install : function(obj){

        for(var key in obj){
            console.log(expand([key, "!**/node_modules/**/*.*", "!**/bower/**/*.*"]));
        }

        return "bower install";

    }

}