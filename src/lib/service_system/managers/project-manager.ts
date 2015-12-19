
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
            reject(error);
        }

        function confirmCreatingRemoteRepo():void
        {
            pa.createRemoteRepository(projectName).then((result:{username:string,repoName:string})=>{
                if(!result)
                {
                    resolve(summary);
                }
                else
                {
                    repoService.addRemoteOrigin(result.username,result.repoName,projectDirectory)
                    .then(()=>{
                        resolve(summary);
                    });
                }
            },(error)=>{
                resolve(summary);
            })
        }


        cliService.warn("Validating...");

        pa.validate(projectType,projectName)
            .then(()=>{
                cliService.logSuccess("Validation Complete.");

                cliService.warn("Creating project directory...");

                pa.createProjectDirectory(projectName)
                    .then((projectDirectoryPath)=>{

                        cliService.logSuccess("Project directory created.");
                        cliService.warn("Copying template...");

                        projectDirectory= projectDirectoryPath;

                        pa.copyTemplate(projectType,projectDirectory,templateName)
                            .then(()=>{

                                cliService.logSuccess("Copying template completed.");

                                cliService.warn("Initializing project...");

                                pa.initializeProject(projectName,projectDirectory)
                                    .then(()=>{

                                        cliService.logSuccess("Project initialized.");
                                        confirmCreatingRemoteRepo();
                                    },doRejection);

                            },doRejection);
                    },doRejection);
            },doRejection);
    });

}
