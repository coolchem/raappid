
var util = require('./util');


util.series(["npm run build","istanbul cover _mocha test/**/*.js --recursive"], function(err){

    if(err)
    {
        console.log(err);
        process.exit(1);
    }

    process.exit(0);
});


