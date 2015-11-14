

var exec = require('child_process').exec;

exec("cat ./coverage/lcov.info | ./node_modules/.bin/coveralls", function(err, stdOut, stdErr){
    console.log(stdOut);
    console.log(stdErr);
});

