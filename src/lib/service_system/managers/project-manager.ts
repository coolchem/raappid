
/// <reference path="../../../typings/tsd.d.ts" />


import pa = require("../assistants/project-assistant");
import cliService = require("../services/cli-service");


export const ERROR_USER_CANCELED_CREATE_PROJECT:string = "Error Creating Project: User canceled project creation";

export const MESSAGE_CONTINUE_WITH_LOCAL_GIT_REPO =
`It Seems there is an issue creating your #repo-type repository.

you can continue to create project with local git repository, and hook in remote git repository at later time.

if you do not want to create the project, please answer No to below question.

Would you like to continue creating the project as a local git repository?`;



export function createProjectCLI(projectType:string,projectName:string,templateName?:string):Promise<string[]>{


    return new Promise((resolve,reject)=>{

        function doRejection(error){

            reject(error);
        }


        var projectDirectory:string;
        var summary:string[] = [];
        cliService.warn("Validating...");
        pa.validate(projectType,projectName)
            .then(()=>{
                cliService.logSuccess("Validation Complete.");

                cliService.warn("Creating Remote Repository...");
                return pa.createRemoteRepository(projectName);
            },doRejection)
            .then((result)=>{


                var remoteRepo:{username:string,repo:string};
                if(result)
                {
                    cliService.logSuccess("Creating Remote repository complete.");

                    remoteRepo = {username:result as string,repo:projectName}
                }
                continueCreatingProjectDir(remoteRepo)

            },(error)=>{

                cliService.confirm(MESSAGE_CONTINUE_WITH_LOCAL_GIT_REPO.replace("#repo-type","GitHub"))
                .then((result)=>{
                    if(result)
                    {
                        continueCreatingProjectDir();
                    }
                    else
                    {
                        doRejection(new Error(ERROR_USER_CANCELED_CREATE_PROJECT));
                    }
                })
            });

        function continueCreatingProjectDir(remoteRepo?:{username:string,repo:string}):void
        {
            cliService.warn("Creating project directory...");

            pa.createProjectDirectory(projectName,remoteRepo)
                .then((projectDirectoryPath)=>{

                    cliService.logSuccess("Project directory complete.");
                    cliService.warn("Copying template...");
                    projectDirectory= projectDirectoryPath;
                    return pa.copyTemplate(projectType,projectDirectory,templateName);
                },doRejection)
                .then(()=>{

                    cliService.logSuccess("Copying template completed.");
                    cliService.warn("Initializing project...");
                    return pa.initializeProject(projectName,projectDirectory);

                },doRejection)
                .then(()=>{

                    cliService.logSuccess("Project initialized.");
                    resolve(summary);
                },(error)=>{
                    cliService.logError(error.message);
                    resolve(summary);
                });
        }
    });

}
