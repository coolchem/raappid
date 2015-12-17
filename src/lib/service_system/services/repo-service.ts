
/// <reference path="../../../typings/tsd.d.ts" />

import shell = require("../utils/shell-util");


var which = require("which");
var GitHubApi = require("github");
export var github = new GitHubApi({
    // required
    version: "3.0.0"
});

export function validateGit():boolean
{
    try
    {
        which.sync("git");
        return true;
    }
    catch (e)
    {
        return false;
    }

}

export function initializeGit(projectDirectory:string):Promise<boolean>
{
    return shell.exec("git init",projectDirectory);
}


export function addAllFilesAndCommit(commitMessage:string,projectDirectory:string):Promise<boolean>
{
    return shell.series(["git add -A",'git commit -m ' + '"'+commitMessage +'"'],projectDirectory);
}


export function cloneGitRepository(username:string,repoName:string,dirToCloneInto:string):Promise<string>
{
    var cmd:string = "git clone https://github.com/" +username+"/"+repoName+".git";
    return shell.exec(cmd,dirToCloneInto).then(()=>{
        return dirToCloneInto+"/"+repoName
    });
}


export function createRemoteRepository(username:string,password:string,repoName:string):Promise<any>
{
    return new Promise((resolve,reject)=>{

        github.authenticate({
            type: "basic",
            username: username,
            password: password
        });

        github.repos.create({name:repoName},(error,result)=>{

            if(error)
            {
                reject(error);
                return;
            }

            resolve(result);
        });
    });
}

