
var util = require('./util');


util.series(["npm run build","istanbul cover node_modules/mocha/bin/_mocha test/**/*.js --recursive"], function(err){

    if(err)
    {
        console.log(err);
        process.exit(1);
    }

    process.exit(0);
});


