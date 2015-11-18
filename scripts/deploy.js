
var util = require('./util');

util.exec("npm publish",function(err){
    if(err)
    {
        console.log(err);
        process.exit(1);
    }

    process.exit(0);
});
