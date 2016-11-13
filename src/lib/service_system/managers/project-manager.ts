
/// <reference path="../../../typings/tsd.d.ts" />


import pa = require("../assistants/project-assistant");
import cliService = require("../services/cli-service");
import repoService = require("../services/repo-service");
import fs = require("fs-extra");

function logStep(message:string,isStaring:boolean = true):string
{
    if(isStaring)
    {
        return cliService.warn(message+"\n");
    }
    return cliService.logSuccess(message+"\n");
}

function confirmCreatingRemoteRepo(resolve,projectName:string,projectDirectory:string,summary:string[]):void
{
    pa.createRemoteRepository(projectName).then((result:{username:string,password:string,repoName:string})=>{
        if(!result)
        {
            doLocalCommit();
            cliService.logSuccess("\nProject Created Successfully!!\n");
            resolve(summary);
        }
        else
        {

            pa.configureRemoteRepo(result.username,result.password,result.repoName,projectDirectory)
                .then(()=>{

                    pa.commitAndPushToRemote(projectDirectory).then(()=>{

                        cliService.logSuccess("\nProject Created Successfully!!\n");
                        resolve(summary);

                    },doCallBack)

                },doCallBack);
        }

    },doCallBack);

    function doLocalCommit(error?):void
    {

        if(error)
            cliService.logError(error.message);

        repoService.addAllFilesAndCommit("First Commit",projectDirectory)
            .then(()=>{
                resolve(summary);
                cliService.logSuccess("\nProject Created Successfully!!\n");

            },(error)=>{

                cliService.logError(error.message);
                cliService.logSuccess("\nProject Created Successfully!!\n");
                resolve(summary);
            })
    }

    function doCallBack(error):void
    {
        doLocalCommit(error);
    }
}

//todo: an effective refactor of the monstrosity below
export function createProjectCLI(mainCommand:string,projectName:string,templateName?:string):Promise<string[]>{

    var projectDirectory:string;
    var summary:string[] = [];

    logStep("Validating...");


    return new Promise((resolve,reject)=>{

        pa.validate(mainCommand,projectName,templateName)
            .then(()=>{


                logStep("Validation Complete.",false);

                logStep("Creating project directory...");

                return pa.createProjectDirectory(projectName)


            },doRejection).then((projectDirectoryPath)=>{

            logStep("Project directory created.",false);

            projectDirectory= projectDirectoryPath;

            logStep("Copying template...");

            return pa.copyTemplate(mainCommand,projectDirectory,templateName);

        },doRejection).then(()=>{

            logStep("Copying template completed.",false);

            logStep("Initializing project...");

            return pa.initializeProject(projectName,projectDirectory);

        },doRejection).then(()=>{

            logStep("Project initialized.",false);
            confirmCreatingRemoteRepo(resolve,projectName,projectDirectory,summary);
            return summary;

        },doRejection).then(()=>{
            resolve(summary);
        });

        function doRejection(error){

            try {
                // Query the entry
                fs.lstatSync(projectDirectory);

                fs.removeSync(projectDirectory);
            }
            catch (e) {
                //means project directory was not created
            }

            cliService.logError(error.message);
            reject(error);
        }
    });

}
