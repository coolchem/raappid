/// <reference path="../../../typings/tsd.d.ts" />


import ps = require("../services/project-service");
import repoService = require("../services/repo-service");
import cliService = require("../services/cli-service");
import reject = Promise.reject;
import {error} from "util";

var fs = require("fs-extra");

export const ERROR_GIT_NOT_INSTALLED:string = "Git not installed installed on the OS. " +
    "Please visit https://git-scm.com/downloads to download and install git ";

export const ERROR_INVALID_PROJECT_NAME:string =
    `Error Project name is invalid : Please make sure there are no spaces or invalid characters in the project name.

         Some of invalid characters:
         / ? < > \ : * | "

         Some valid project name examples:
         my-project, my_project, MyProject or myproject`;

export const ERROR_INVALID_PROJECT_TYPE:string = "Error Project type invalid: Please provide from these options, node-app | web-app | template";

export const ERROR_INVALID_TEMPLATE_NAME:string = "Template name is required to create the project.";


export const ERROR_CREATING_REPO_BAD_CREDENTIALS:string =`Error Creating #repo-type repository: Your username or password is in valid`;

export const MESSAGE_CREATE_REMOTE_REPO:string = "Would like to create a #repo-type repository for your project?";
export const MESSAGE_RE_ENTER_CREDENTIALS:string =
    `
    --Please enter your credentials to try again--

    `;

export const MESSAGE_REPO_NAME_ALREADY_EXISTS:string= `Repository with name '#repo-name' already exists in you #repo-type account`;

export const MESSAGE_ENTER_REPO_NAME:string =
    `
    --Please enter another name for your repository--

    `;

export const ERROR_CREATING_REMOTE_REPO:string =

`There was an issue creating remote repository for your project.
you can add the remote repository to you project by following instructions from the url below:

https://help.github.com/articles/adding-a-remote/`;


function askCredentials():Promise<{username:string,password:string}>
{
    var username:string;
    var password:string;


    return new Promise((resolve)=>{

        return cliService.askInput("Enter Username").then((result)=>{

            username = result;

            return cliService.askInput("Enter Password",true).then((result)=>{
                password = result;

                resolve({username:username,password:password});
            })
        });

    });
}

function askToReEnterCredentials():Promise<{username:string,password:string}>
{
    cliService.logError(ERROR_CREATING_REPO_BAD_CREDENTIALS.replace("#repo-type","GitHub"));
    cliService.log(MESSAGE_RE_ENTER_CREDENTIALS,"yellow");

    return askCredentials();
}

function askToEnterNewRepoName(repoName:string):Promise<string>
{
    cliService.logError(MESSAGE_REPO_NAME_ALREADY_EXISTS.replace("#repo-type","GitHub").replace("#repo-name",repoName));
    cliService.log(MESSAGE_ENTER_REPO_NAME,"yellow");

    return cliService.askInput("Enter New Repository Name");
}

export function validate(mainCommand:string,projectName:string,templateName?:string):Promise<boolean>
{

    return new Promise((resolve,reject)=>{
        // check if valid git
        if(!repoService.validateGit())
        {
            throw new Error(ERROR_GIT_NOT_INSTALLED);
        }

        if(mainCommand !== "create")
        {
            if(!ps.validateProjectType(mainCommand))
            {
                throw new Error(ERROR_INVALID_PROJECT_TYPE);

            }
        }
        else
        {
            if(!templateName || templateName === "")
            {
               throw new Error(ERROR_INVALID_TEMPLATE_NAME);
            }
        }

        if(!ps.validateProjectName(projectName))
        {
            throw new Error(ERROR_INVALID_PROJECT_NAME);

        }

        resolve(true);

    });
}

export function configureRemoteRepo(username:string,password:string,repoName:string,projectDir:string):Promise<any>{

    return new Promise((resolve,reject)=>{

        repoService.getUsersPrimaryEmail(username,password)
        .then((userEmail)=>{

            repoService.configureGit(username,userEmail,repoName,projectDir)
            .then(resolve,reject);

        },reject)
    });
}

export function createRemoteRepository(projectName:string):Promise<{username:string,repoName:string}>
{

    return new Promise((resolve,reject)=>{

        var username:string;
        var password:string;
        var repoName:string = projectName;

        var credentialsFailCount:number = 0;
        var repoNameValidationFailCount:number = 0;

        //ask user if they want to create github repo
        cliService.confirm(MESSAGE_CREATE_REMOTE_REPO.replace("#repo-type","GitHub"),"yellow").then((result)=>{

            if(result)
            {

                askCredentials().then((result)=>{

                    username = result.username;
                    password = result.password;

                    createRepo();

                })

            }
            else
            {
                resolve(null);
            }
        });



        function createRepo():void
        {
            repoService.createRemoteRepository(username,password,repoName)
                .then(()=>{

                    resolve({username:username,password:password,repoName:repoName});

                },(error)=>{

                    if(error.code == 401)  {

                        credentialsFailCount++;
                        if(credentialsFailCount < 3)
                        {

                            askToReEnterCredentials().then((result)=>{
                                username = result.username;
                                password = result.password;

                                createRepo();
                            });
                        }
                        else
                        {
                            doRejection(error);
                        }
                    }
                    else
                    {
                        var message:any = JSON.parse(error.message);
                        if(error.code == 422 && message.message == "Validation Failed")
                        {
                            repoNameValidationFailCount++;

                            if(repoNameValidationFailCount < 3)
                            {
                                askToEnterNewRepoName(repoName).then((repo)=>{
                                    repoName = repo;
                                    createRepo();
                                })
                            }
                            else
                            {
                                doRejection(error);
                            }
                        }
                        else
                        {
                            doRejection(error);
                        }
                    }
                });
        }


        function doRejection(error):void
        {
            reject(new Error(ERROR_CREATING_REMOTE_REPO));
        }

    });


}

export function commitAndPushToRemote(projectDirectory:string):Promise<boolean>
{
    return new Promise((resolve,reject)=>{

        repoService.addAllFilesAndCommit("First Commit",projectDirectory)
        .then(()=>{

            repoService.pushOriginMaster(projectDirectory)
            .then(resolve,reject);

        },reject)
    })
}

export function createProjectDirectory(projectName:string):Promise<string>
{

    var projectDir:string = process.cwd()+"/"+projectName;

    return new Promise((resolve)=>{

        fs.emptyDirSync(projectDir);


        repoService.initializeGit(projectDir).then(()=>{
            resolve(projectDir);
        });

    });
}
export function copyTemplate(projectType:string,projectDirectory:string,templateName:string):Promise<boolean>
{

    fs.writeFileSync(projectDirectory+"/package.json",JSON.stringify({version:"0.0.1",  devDependencies: {}}, null, '  ') + '\n');

    return ps.downloadTemplate(projectType,projectDirectory,templateName).then((templatePath:string)=>{

        fs.copySync(templatePath,projectDirectory);

        fs.removeSync(templatePath);
        return true;
    });
}


export function initializeProject(projectName:string,projectDirectory:string):Promise<any>
{
    //update package.json

    ps.sanitizePackage(projectName,projectDirectory);

    return ps.installDependencies(projectDirectory).then(()=>{
        return ps.doAdditionalSetup(projectDirectory)
    })
}
