/// <reference path="../../../typings/tsd.d.ts" />

import fs = require("fs-extra");
import shell = require("../utils/shell-util");

var PROJECT_TYPE_BASIC:string = "basic";
var PROJECT_TYPE_NODE:string = "node-app";
var PROJECT_TYPE_WEB:string = "web-app";
var PROJECT_TYPE_TEMPLATE:string = "template";

export const ERROR_INVALID_PROJECT_NAME:string =
    `Error Project name is invalid : Please make sure there are no spaces or invalid characters in the project name.

         Some of invalid characters:
         / ? < > \ : * | "

         Some valid project name examples:
         my-project, my_project, MyProject or myproject`;

export const ERROR_INVALID_PROJECT_TYPE:string = "Error Project type invalid: Please provide from these options, node-app | web-app | template";

export function validateProjectType(type:string):boolean|Error
{
    if(type !== PROJECT_TYPE_NODE &&  type !== PROJECT_TYPE_WEB && type !== PROJECT_TYPE_TEMPLATE && type !== PROJECT_TYPE_BASIC)
    {
        return new Error(ERROR_INVALID_PROJECT_TYPE);
    }

    return true;
}

export function validateProjectName(name:string):boolean|Error
{
    var rx = /[<>:"\s\/\\|?*\x00-\x1F]|^(?:aux|con|clock\$|nul|prn|com[1-9]|lpt[1-9])$/i;

    if(rx.test(name))
    {
       return new Error(ERROR_INVALID_PROJECT_NAME);
    }
    return true;
}

export function downloadTemplate(projectType:string,projectDirectoryPath:string,templateName?:string):Promise<boolean>
{

    var cmd:string = "npm install ";

    if(projectType == PROJECT_TYPE_BASIC)
    {
        cmd += "raappid/template-basic"
    }

    if(templateName)
    {
        cmd += templateName;
    }
    else
    {
        switch (projectType)
        {
            case PROJECT_TYPE_NODE:
                cmd+="raappid/template-node-app-basic";
                break;
            case PROJECT_TYPE_WEB:
                cmd+="raappid/template-web-app-basic";
                break;
            case PROJECT_TYPE_TEMPLATE:
                cmd+="raappid/template-basic";
                break;
        }
    }

    return shell.exec(cmd,projectDirectoryPath);
}

export function installDependencies(projectDirectoryPath:string):Promise<boolean>
{

    return new Promise((resolve,reject)=>{


        shell.exec("npm install",projectDirectoryPath).then((result)=>{

            try {
                fs.lstatSync(projectDirectoryPath+"/scripts/install.js");

                var cmd = "node " + projectDirectoryPath+ "/scripts/install.js";

                shell.exec(cmd,projectDirectoryPath).then((result)=>{
                    resolve(result);
                },(error)=>{
                    reject(error);
                })
            }
            catch (e)
            {
                resolve(result);
            }


        },(error)=>{
            reject(error);
        })
    });


}


