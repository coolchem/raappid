
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

export function pushOriginMaster(projectDirectory:string):Promise<boolean>
{
    return shell.exec("git push -u origin master",projectDirectory);
}


export function cloneGitRepository(username:string,repoName:string,dirToCloneInto:string):Promise<string>
{
    var cmd:string = "git clone https://github.com/" +username+"/"+repoName+".git";
    return shell.exec(cmd,dirToCloneInto).then(()=>{
        return dirToCloneInto+"/"+repoName
    });
}

export function addRemoteOrigin(username:string,repoName:string,projectDirectory:string):Promise<any>
{
    var cmd:string = "git remote add origin https://github.com/" +username+"/"+repoName+".git";

    return shell.exec(cmd,projectDirectory);
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

export function configureGit(username:string,userEmail:string,repoName:string,projectDir:string):Promise<any>
{
    var addRemoteOriginCmd:string = "git remote add origin https://github.com/" +username+"/"+repoName+".git";
    var configEmailCmd:string = 'git config user.email ' +'"'+userEmail+'"';
    var configUserCmd:string = 'git config user.name ' +'"'+username+'"';

    return shell.series([configEmailCmd,configUserCmd,addRemoteOriginCmd],projectDir);
}

export function getUsersPrimaryEmail(username:string,password:string):Promise<string>{

    return new Promise((resolve,reject)=>{

        github.authenticate({
            type: "basic",
            username: username,
            password: password
        });

        github.user.getEmails({},(error,results:Array<any>)=>{

            if(error)
            {
                reject(error);
                return;
            }

            var primaryEmail:string = "";
            for(var i = 0; i < results.length; i++)
            {
                if(results[i].primary == true)
                {
                    primaryEmail = results[i].email;
                }
            }
            resolve(primaryEmail);
        });
    });
}

