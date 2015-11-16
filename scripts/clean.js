

var del = require('del');

var paths = del.sync(['src/**/*.js','test/**/*.js','dist','**/*.map','!node_modules/**/*.map']);


console.log('Deleted files/folders:\n', paths.join('\n'));


