/// <reference path="../../../typings/tsd.d.ts" />

import fs = require("fs-extra");
import shell = require("../utils/shell-util");
import path = require('path');

var PROJECT_TYPE_BASIC:string = "basic";
var PROJECT_TYPE_NODE:string = "node-app";
var PROJECT_TYPE_WEB:string = "web-app";
var PROJECT_TYPE_NODE_MODULE:string = "node-module";
var PROJECT_TYPE_BROWSER_MODULE:string = "browser-module";
var PROJECT_TYPE_TEMPLATE:string = "template";


export function validateProjectType(type:string):boolean
{

    return type == PROJECT_TYPE_NODE
        || type == PROJECT_TYPE_WEB
        || type == PROJECT_TYPE_TEMPLATE
        || type == PROJECT_TYPE_BASIC
        || type == PROJECT_TYPE_NODE_MODULE
        || type == PROJECT_TYPE_BROWSER_MODULE
}

export function validateProjectName(name:string):boolean
{
    var rx = /[<>:"\s\/\\|?*\x00-\x1F]|^(?:aux|con|clock\$|nul|prn|com[1-9]|lpt[1-9])$/i;

    return !rx.test(name);
}

export function downloadTemplate(projectType:string,projectDirectoryPath:string,templateName:string = ""):Promise<string>
{

    var cmd:string = "git clone ";

    switch (projectType)
    {
        case PROJECT_TYPE_BASIC:
            templateName ="raappid/template-basic";
            break;
        case PROJECT_TYPE_NODE:
            templateName ="raappid/template-node-app-basic";
            break;
        case PROJECT_TYPE_WEB:
            templateName ="raappid/template-web-app-basic";
            break;
        case PROJECT_TYPE_NODE_MODULE:
            templateName ="raappid/template-node-module-basic";
            break;
        case PROJECT_TYPE_BROWSER_MODULE:
            templateName ="raappid/template-browser-module-basic";
            break;
        case PROJECT_TYPE_TEMPLATE:
            templateName ="raappid/template-basic";
            break;
    }

    var names:string[] = templateName.split(":");
    var repoHostName:string = "github.com";
    var repoName:string = "";
    if(names.length == 2)
    {
        templateName = names[1];
        var repoInfo:string[] = names[1].split("/");

        if(names[0] == "bitbucket")
        {

            //coolchem@bitbucket.org
            repoHostName=repoInfo[0]+"@bitbucket.org";
        }
        else
        {
            repoHostName = names[0]+".com";
        }
        repoName = repoInfo[1];

    }
    else
    {
        repoName = templateName.split("/")[1];
    }

    templateName = "https://"+repoHostName+"/"+templateName+".git";

    cmd += templateName;

    return new Promise((resolve,reject)=>{

        shell.exec(cmd,projectDirectoryPath).then(()=>{

            var templatePath:string = projectDirectoryPath+"/"+repoName;

            fs.removeSync(templatePath+"/.git");
            resolve(templatePath);
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
                fs.lstatSync(projectDirectoryPath+"/scripts/install-other-dependencies.js");

                var cmd = "node " + projectDirectoryPath+ "/scripts/install-other-dependencies.js";

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

export function sanitizePackage(projectName:string, projectDirectory:string):Object
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
    newPackage.readme = "";
    newPackage.readmeFilename= "";

    fs.writeFileSync(projectDirectory+"/package.json",JSON.stringify(newPackage, null, '  ') + '\n');


    try {
        //check for .npmignore and rename it to .gitignore
        fs.lstatSync(projectDirectory+"/.npmignore");
        fs.renameSync(projectDirectory+"/.npmignore",projectDirectory+"/.gitignore");
    }
    catch (e) {
        //means .gitIgnore not found
    }

    return newPackage;
}




