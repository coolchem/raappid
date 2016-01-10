

var util = require('./util');

util.exec("tsd install",function(error){

    if(error)
    {
        console.log(error);
        process.exit(1);
    }

    process.exit(0);
});