#!/usr/bin/env node

/// <reference path="typings/tsd.d.ts" />

var argv:any = require('minimist')(process.argv.slice(2));


// Set env var for ORIGINAL cwd
// before anything touches it
process.env.INIT_CWD = process.cwd();

function run():void {

    //check if --help or -h show instructions and exit
    if(argv.help === true || argv.h === true)
    {
        showInstructions();
    }
    else
    {

    }
}

function showInstructions(){

}


run();