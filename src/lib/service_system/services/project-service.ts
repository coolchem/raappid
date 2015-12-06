/// <reference path="../../../typings/tsd.d.ts" />

import fs = require("fs-extra");
import shell = require("../utils/shell-util");

export const ERROR_INVALID_PROJECT_NAME:string =
    `Error Project name is invalid : Please make sure there are no spaces or invalid characters in the project name.

         Some of invalid characters:
         / ? < > \ : * | "

         Some valid project name examples:
         my-project, my_project, MyProject or myproject`;

export const ERROR_INVALID_PROJECT_TYPE:string = "Error Project type invalid: Please provide from these options, node-app | web-app | template";

export function validateProjectType(type:string):boolean|Error
{
    if(type !== "node-app" &&  type !== "web-app" && type !== "template" && type !== "basic")
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

export function initializeProject(projectDirectoryPath:string):Promise<boolean>
{

    return new Promise((resolve,reject)=>{

        try {
            fs.lstatSync(projectDirectoryPath+"/scripts/install.js");

            var cmd = "node " + projectDirectoryPath+ "/scripts/install.js";

            shell.exec(cmd,projectDirectoryPath).then((result)=>{
                try
                {
                    fs.lstatSync(projectDirectoryPath+"/node_modules");
                    resolve(true);
                }
                catch(e)
                {
                    shell.exec("npm install",projectDirectoryPath).then((result)=>{
                        resolve(result);
                    },(error)=>{
                        reject(error);
                    })
                }
            },(error)=>{
                reject(error);
            })
        }
        catch (e) {

            shell.exec("npm install",projectDirectoryPath).then((result)=>{
                resolve(result);
            },(error)=>{
                reject(error);
            })
        }
    });


}


