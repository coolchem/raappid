
var exec = require('child_process').exec;

exec("istanbul cover _mocha test/**/*.js --recursive", function(err, stdOut, stdErr){
    console.log(stdOut);
    console.log(stdErr);
});


