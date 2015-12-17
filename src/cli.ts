#!/usr/bin/env node

/// <reference path="typings/tsd.d.ts" />

import {actionControl,Action} from "./main";

var argv:any = require('minimist')(process.argv.slice(2));


// Set env var for ORIGINAL cwd
// before anything touches it
process.env.INIT_CWD = process.cwd();

actionControl.perform(Action.PROCESS_ARGUMENTS,argv).then((result)=>{

    return actionControl.perform(Action.CREATE_PROJECT_CLI,result.projectType,result.projectName,result.templateName)
},(error)=>{
console.log(error);
process.exit(1);
}).then(()=>{
    console.log("Project Created successfully.");
    process.exit(0);
},(error)=>{
    console.log(error);
    process.exit(1);
});



