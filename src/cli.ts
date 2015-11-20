#!/usr/bin/env node

/// <reference path="typings/tsd.d.ts" />

import main = require("./main");
import viewSystem = require("./lib/view_system/view-system")
import {CmdView} from "./lib/view_system/views/CmdView";

var argv:any = require('minimist')(process.argv.slice(2));


// Set env var for ORIGINAL cwd
// before anything touches it
process.env.INIT_CWD = process.cwd();

var cliView:CmdView = viewSystem.createView(CmdView);

cliView.processArguments(argv);

process.on("exit",(code)=>{

    if(code === 0)
    {
        console.log("\nYay!!l\n");
    }

});


