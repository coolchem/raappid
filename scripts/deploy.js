
var util = require('./util');

util.series(["npm test",
    "npm run build-release",
    "npm publish"],function(err){
    if(err)
    {
        console.log(err);
        process.exit(1);
    }

    process.exit(0);
});

