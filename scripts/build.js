
var util = require('./util');
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

function build(isRelease){

    var cmd = "tsc";

    if(isRelease)
        cmd = cmd + " -p src --outDir dist";

    util.series(["npm run clean",cmd], function (err) {

        if(err)
        {
            console.log(err);
            process.exit(1);
        }

        process.exit(0);
    });

}
