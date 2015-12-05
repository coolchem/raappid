#!/usr/bin/env node

/// <reference path="typings/tsd.d.ts" />

import {actionControl as ac} from "./main";

var argv:any = require('minimist')(process.argv.slice(2));


// Set env var for ORIGINAL cwd
// before anything touches it
process.env.INIT_CWD = process.cwd();

ac.perform("processArguments",argv).then((result)=>{




},(error)=>{



});


