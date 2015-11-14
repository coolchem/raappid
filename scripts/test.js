
var execSync = require('child_process').execSync;
var exec = require('child_process').exec;

//build dev
execSync("npm run build");
//test src


exec("istanbul cover _mocha test/**/*.js --recursive", function(err, stdOut, stdErr){
    console.log(stdOut);
    console.log(stdErr);
});

process.on("exit", function(code){
    console.log(code);
});

