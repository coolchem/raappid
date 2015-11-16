
var util = require('./util');

util.exec("cat ./coverage/lcov.info | ./node_modules/.bin/coveralls", function(err, stdOut, stdErr){
    console.log(stdOut);
    console.log(stdErr);
});

