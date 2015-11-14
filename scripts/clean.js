

var del = require('del');

del(['src/**/*.js','test/**/*.js','dist','**/*.map','!node_modules/**/*.map'], function(paths){

    console.log('Deleted files/folders:\n', paths.join('\n'));
});


