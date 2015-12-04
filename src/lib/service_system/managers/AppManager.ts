


import {Manager} from "./Manager";
export class AppManager extends Manager
{
    static CLI_HELP_TEXT:string =
        `Command:

         raappid [project-type] <<project-name>> --using <<template-name>>

         Options:

         project-type: node-app | web-app | template

         project-name: it is the name you want to give to your project,
                       a folder with your project name will be created in the directory where the command is run

                       Requirements: name should be single word for example, my-project, my_project, MyProject or myproject etc.

         template-name: template name refers to the remote repository from which the project will be based on.
                        If no template name is provided the default templates for each app will be used to create the project.

                        Examples:
                        npm-package-name
                        githubname/reponame
                        bitbucket:mybitbucketuser/myproject
                        gitlab:mygitlabuser/myproject

         Sample Commands:

         raappid web-app myTestProject
         raappid node-app myTestProject --using coolchem/node-cli-basic

         `;


    static ERROR_ARGUMENTS_MISMATCH:string = "Error arguments mismatch: Both Project type and Project name must be provided";
    static ERROR_INVALID_PROJECT_TYPE:string = "Error Project type invalid: Please provide from these options, node-app | web-app | template";
    static ERROR_INVALID_PROJECT_NAME:string =
        `Error Project name is invalid : Please make sure there are no spaces or invalid characters in the project name.

         Some of invalid characters:
         / ? < > \ : * | "

         Some valid project name examples:
         my-project, my_project, MyProject or myproject`;

    protected initialize():void {

        this.registerAction("processCLIArguments",this.processCLIArguments)
    }

    processCLIArguments(argv:any):Promise<any>
    {
        if(argv.help === true || argv.h === true)
        {
            this.publish("cliLog",AppManager.CLI_HELP_TEXT);
            return;
        }

        var commands:string[] = argv._;

        if(commands.length < 2)
        {
            this.publish("cliLogError",AppManager.ERROR_ARGUMENTS_MISMATCH);
            throw new Error(AppManager.ERROR_ARGUMENTS_MISMATCH);
        }
        else if(commands.length > 2)
        {
            this.publish("cliLogError",AppManager.ERROR_INVALID_PROJECT_NAME);
            throw new Error(AppManager.ERROR_INVALID_PROJECT_NAME);
        }

        var projectType:string = commands[0];
        var projectName:string = commands[1];
        var templateName:string = "";


        if(argv.hasOwnProperty("using") && typeof argv.using == "string")
        {
            templateName = argv.using;
        }

        var rx = /[<>:"\/\\|?*\x00-\x1F]|^(?:aux|con|clock\$|nul|prn|com[1-9]|lpt[1-9])$/i;

        if(rx.test(projectName))
        {
            this.publish("cliLogError",AppManager.ERROR_INVALID_PROJECT_NAME);
            throw new Error(AppManager.ERROR_INVALID_PROJECT_NAME);
        }

        if(projectType !== "node-app" &&  projectType !== "web-app" && projectType !== "template")
        {
            this.publish("cliLogError",AppManager.ERROR_INVALID_PROJECT_TYPE);
            throw new Error(AppManager.ERROR_INVALID_PROJECT_TYPE);
        }

        return new Promise((resolve,reject)=>{
            this.perform("createProject",projectType,projectName,templateName).then((result:string)=>{

                this.publish("cliLogSuccess",result);
                resolve(result);


            },(error)=>{

                this.publish("cliLogError",error);
                reject(error);
            });
        })
    }


}
