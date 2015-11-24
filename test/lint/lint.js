
var horde = require("../../index");

horde.util.log.raw("");

horde.util.cache.clean();

horde.task.process.folders({
    build : "",
    folders : {
        "src" : "",
        "test/lint" : "",
        "test/tests" : ""
    }
}, "lint").then(function(){

    horde.util.log.raw("");
    horde.util.log.ok("All files lint free".green);

}, function(errors){

    horde.util.log.raw("");

    errors.forEach(function(error){
        error.forEach(function(line){
            console.log(line);
        });
    });

    horde.util.log.error("Some lint errors were found".red);

});
