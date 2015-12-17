/// <reference path="../../../typings/tsd.d.ts" />


import ps = require("../services/project-service");
import repoService = require("../services/repo-service");
import fs = require("fs-extra");
import cliService = require("../services/cli-service");

export const ERROR_GIT_NOT_INSTALLED:string = "Git not installed installed on the OS. " +
    "Please visit https://git-scm.com/downloads to download and install git ";

export const ERROR_INVALID_PROJECT_NAME:string =
    `Error Project name is invalid : Please make sure there are no spaces or invalid characters in the project name.

         Some of invalid characters:
         / ? < > \ : * | "

         Some valid project name examples:
         my-project, my_project, MyProject or myproject`;

export const ERROR_INVALID_PROJECT_TYPE:string = "Error Project type invalid: Please provide from these options, node-app | web-app | template";

export const ERROR_CREATING_REPO_BAD_CREDENTIALS:string =`Error Creating #repo-type repository: Your username or password is in valid`;

export const MESSAGE_CREATE_REMOTE_REPO:string = "Would like to create a #repo-type repository for your project?";
export const MESSAGE_RE_ENTER_CREDENTIALS:string =
    `
    --Please enter your credentials to try again--

    `;

function askCredentials():Promise<{username:string,password:string}>
{
    var username:string;
    var password:string;


    return new Promise((resolve)=>{

        return cliService.askInput("Enter Username").then((result)=>{

            username = result;

            return cliService.askInput("Enter Password").then((result)=>{
                password = result;

                resolve({username:username,password:password});
            })
        });

    });
}

function askToReEnterCredentials():Promise<{username:string,password:string}>
{
    cliService.logError(ERROR_CREATING_REPO_BAD_CREDENTIALS.replace("#repo-type","GitHub"));
    cliService.log(MESSAGE_RE_ENTER_CREDENTIALS);

    return askCredentials();
}

export function validate(projectType:string,projectName:string):Promise<boolean>
{

    return new Promise((resolve,reject)=>{
        // check if valid git
        if(!repoService.validateGit())
        {
            throw new Error(ERROR_GIT_NOT_INSTALLED);
        }

        if(!ps.validateProjectType(projectType))
        {
            throw new Error(ERROR_INVALID_PROJECT_TYPE);

        }

        if(!ps.validateProjectName(projectName))
        {
            throw new Error(ERROR_INVALID_PROJECT_NAME);

        }

        resolve(true);

    });
}

export function createRemoteRepository(projectName:string):Promise<boolean|string>
{

    return new Promise((resolve,reject)=>{

        //ask user if they want to create github repo
        cliService.confirm(MESSAGE_CREATE_REMOTE_REPO.replace("#repo-type","GitHub")).then((result)=>{


            if(result)
            {
                askCredentials().then((result)=>{

                    repoService.createRemoteRepository(result.username,result.password,projectName).then(()=>{

                            resolve(result.username)
                        },
                        (error)=>{

                            if(error.code == 401)
                            {
                                askToReEnterCredentials().then((result2)=>{

                                    repoService.createRemoteRepository(result2.username,result2.password,projectName).then(()=>{
                                        resolve(result2.username)
                                    },reject)

                                });
                            }
                            else
                            {
                                reject(error);
                            }

                        });
                })

            }
            else
            {
                resolve(false);
            }
        });


    });


}

export function createProjectDirectory(projectName:string,remoteRepo?:{username:string,repo:string}):Promise<string>
{

    var projectDir:string = process.cwd()+"/"+projectName;

    if(remoteRepo)
        return repoService.cloneGitRepository(remoteRepo.username,remoteRepo.repo,process.cwd());


    return new Promise((resolve)=>{

        fs.mkdirsSync(projectDir);

        repoService.initializeGit(projectDir).then(()=>{
            resolve(projectDir);
        });

    });
}
export function copyTemplate(projectType:string,projectDirectory:string,templateName:string):Promise<boolean>
{

    return ps.downloadTemplate(projectType,projectDirectory,templateName).then((templatePath:string)=>{

        fs.copySync(templatePath,projectDirectory);

        return true;
    });
}


export function initializeProject(projectName:string,projectDirectory:string):Promise<any>
{
    //update package.json

    ps.sanitizePackageJson(projectName,projectDirectory);

    return ps.installDependencies(projectDirectory);
}
