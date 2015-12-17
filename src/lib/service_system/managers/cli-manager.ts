
import cliService = require("../services/cli-service");

export const CLI_HELP_TEXT:string =
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

export const ERROR_ARGUMENTS_MISMATCH:string = "Error arguments mismatch: Both Project type and Project name must be provided";

export const ERROR_INVALID_PROJECT_NAME:string =
    `Error Project name is invalid : Please make sure there are no spaces or invalid characters in the project name.

         Some of invalid characters:
         / ? < > \ : * | "

         Some valid project name examples:
         my-project, my_project, MyProject or myproject`;

export function processArguments(argv:any):{projectType:string,
    projectName:string,templateName:string}{

    if(argv.help === true || argv.h === true)
    {
        cliService.log(CLI_HELP_TEXT);
        return null;
    }

    var commands:string[] = argv._;

    if(commands.length < 2)
    {
        throw new Error(ERROR_ARGUMENTS_MISMATCH);
    }
    else if(commands.length > 2)
    {
        throw new Error(ERROR_INVALID_PROJECT_NAME);
    }

    var projectType:string = commands[0];
    var projectName:string = commands[1];
    var templateName:string = "";

    if(argv.hasOwnProperty("using") && typeof argv.using == "string")
    {
        templateName = argv.using;
    }


    return {projectType:projectType,projectName:projectName,templateName:templateName};

}