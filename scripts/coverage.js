

var exec = require('child_process').exec;

exec("cat ./coverage/lcov.info | ./node_modules/.bin/coveralls", function(err, stdOut, stdErr){
    console.log(stdOut);
    console.log(stdErr);
    if(err)
    {
        process.exit(1);
    }

    process.exit(0);
});

