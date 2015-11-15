
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var argv = require('minimist')(process.argv.slice(2));


if(argv._ && argv._.length > 0) //look release build
{
    var subCommand = argv._[0];
    if(subCommand.toLowerCase() === "release")
    {
        build(true);
    }

}
else //do dev build
{
    build();
}

function build(isRelease,watch){

    var cmd = "node_modules/.bin/tsc";

    if(isRelease)
        cmd = cmd + " -p src --outDir dist";

    exec(cmd, function (err, stdout, stderr) {
        console.log(stdout);

        if(err)
        {
            process.exit(1);
        }

        process.exit(0);
    });

}
