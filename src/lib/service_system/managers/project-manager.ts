
/// <reference path="../../../typings/tsd.d.ts" />


import pa = require("../assistants/project-assistant");
import cliService = require("../services/cli-service");
import fs = require("fs-extra");
import repoService = require("../services/repo-service");



export const ERROR_USER_CANCELED_CREATE_PROJECT:string = "Error Creating Project: User canceled project creation";

export const MESSAGE_CONTINUE_WITH_LOCAL_GIT_REPO =
`It Seems there is an issue creating your #repo-type repository.

you can hook in remote git repository at later time.

if you do not want to create the project, please answer No to below question.

Would you like to continue creating the project as a local git repository?`;


function logStep(message:string,isStaring:boolean = true):string
{
    if(isStaring)
    {
        return cliService.warn(message+"\n");
    }
    return cliService.logSuccess(message+"\n");
}

//todo: an effective refactor of the function below
export function createProjectCLI(projectType:string,projectName:string,templateName?:string):Promise<string[]>{


    return new Promise((resolve,reject)=>{


        var projectDirectory:string;
        var summary:string[] = [];

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

        function confirmCreatingRemoteRepo():void
        {
            pa.createRemoteRepository(projectName).then((result:{username:string,repoName:string})=>{
                if(!result)
                {
                    cliService.logSuccess("\nProject Created Successfully!!\n");
                    resolve(summary);
                }
                else
                {
                    repoService.addRemoteOrigin(result.username,result.repoName,projectDirectory)
                    .then(()=>{
                        cliService.logSuccess("\nProject Created Successfully!!\n");
                        resolve(summary);
                    });
                }
            },(error)=>{
                resolve(summary);
            })
        }


        logStep("Validating...");

        pa.validate(projectType,projectName)
            .then(()=>{
                logStep("Validation Complete.",false);

                logStep("Creating project directory...");

                pa.createProjectDirectory(projectName)
                    .then((projectDirectoryPath)=>{

                        logStep("Project directory created.",false);
                        logStep("Copying template...");

                        projectDirectory= projectDirectoryPath;

                        pa.copyTemplate(projectType,projectDirectory,templateName)
                            .then(()=>{

                                logStep("Copying template completed.",false);

                                logStep("Initializing project...");

                                pa.initializeProject(projectName,projectDirectory)
                                    .then(()=>{

                                        logStep("Project initialized.",false);
                                        confirmCreatingRemoteRepo();
                                    },doRejection);

                            },doRejection);
                    },doRejection);
            },doRejection);
    });

}
