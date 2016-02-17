#!/usr/bin/env node

/// <reference path="typings/tsd.d.ts" />

import {actionControl,Action} from "./main";

var argv:any = require('minimist')(process.argv.slice(2));


// Set env var for ORIGINAL cwd
// before anything touches it
process.env.INIT_CWD = process.cwd();

actionControl.perform(Action.PROCESS_ARGUMENTS,argv)
    .then((result)=>{

       actionControl.perform(Action.CREATE_PROJECT_CLI,result.mainCommand,result.projectName,result.templateName)
        .then(()=>{
            process.exit(0);

        },(error)=>{

            process.exit(1);
        })

    },(error)=>{

        process.exit(1);

    });



