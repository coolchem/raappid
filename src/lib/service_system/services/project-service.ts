/// <reference path="../../../typings/tsd.d.ts" />

import fs = require("fs-extra");
import shell = require("../utils/shell-util");

var PROJECT_TYPE_BASIC:string = "basic";
var PROJECT_TYPE_NODE:string = "node-app";
var PROJECT_TYPE_WEB:string = "web-app";
var PROJECT_TYPE_TEMPLATE:string = "template";


export function validateProjectType(type:string):boolean
{

    return type == PROJECT_TYPE_NODE ||  type == PROJECT_TYPE_WEB || type == PROJECT_TYPE_TEMPLATE || type == PROJECT_TYPE_BASIC;
}

export function validateProjectName(name:string):boolean
{
    var rx = /[<>:"\s\/\\|?*\x00-\x1F]|^(?:aux|con|clock\$|nul|prn|com[1-9]|lpt[1-9])$/i;

    return !rx.test(name);
}

export function downloadTemplate(projectType:string,projectDirectoryPath:string,templateName?:string):Promise<string>
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

    return new Promise((resolve,reject)=>{

        shell.exec(cmd,projectDirectoryPath).then(()=>{

            resolve(projectDirectoryPath+"/node_modules"+templateName)
        },(error)=>{
            reject(error);
        })
    });

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

export function sanitizePackageJson(projectName:string, projectDirectory:string):Object
{
    var pkg:any = JSON.parse(fs.readFileSync(projectDirectory+"/package.json", 'utf8'));

    var newPackage:any = {};

    for (var key in pkg)
    {
        if(key.indexOf("_") !== 0 && key.toLowerCase() !== "githead")
        {
            newPackage[key] = pkg[key];
        }
    }
    newPackage.name = projectName;
    newPackage.description = "";
    newPackage.version = "0.0.1";
    newPackage.author = {name:""};
    newPackage.bugs = {url:""};
    newPackage.repository = {url:"",type:""};
    newPackage.licenses = [];
    newPackage.keywords = [];

    fs.writeFileSync(projectDirectory+"/package.json",JSON.stringify(newPackage, null, '  ') + '\n');
    return newPackage;
}



