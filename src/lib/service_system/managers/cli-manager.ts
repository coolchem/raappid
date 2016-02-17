
import cliService = require("../services/cli-service");

export const CLI_HELP_TEXT:string =
    `Command:

         raappid -v or  --version  ( gives the version of raappid application)

         Main command:

         raappid create <<project-name>> --using <<template-name>>
                                    or
         raappid create <<project-name>> -u <<template-name>>

         Shortcut command:

         raappid [project-type] <<project-name>>

         Options:

         project-type: node-app | web-app | node-module | browser-module | template

         project-name: it is the name you want to give to your project,
                       a folder with your project name will be created in the directory
                       where the command is run

                       Requirements: name should be single word for example,
                       my-project, my_project, MyProject or myproject etc.

         template-name: template name refers to the remote repository from which
                        the project will be based on.

                        Examples:
                        githubname/reponame
                        bitbucket:mybitbucketuser/myproject
                        gitlab:mygitlabuser/myproject

         Sample Commands:

         raappid create myTestProject --using raappid/template-node-app-basic
         raappid create myTestProject -u raappid/template-node-app-basic
         raappid web-app myTestProject
         raappid node-app myTestProject

         `;

export const ERROR_ARGUMENTS_MISMATCH:string = "Error arguments mismatch: please make sure the command entered is correct";

export const ERROR_INVALID_PROJECT_NAME:string =
    `Error Project name is invalid : Please make sure there are no spaces or invalid characters in the project name.

         Some of invalid characters:
         / ? < > \ : * | "

         Some valid project name examples:
         my-project, my_project, MyProject or myproject`;

export function processArguments(argv:any):{mainCommand:string,
    projectName:string,templateName:string}{

    var error:Error;
    if(argv.help === true || argv.h === true)
    {
        cliService.log(CLI_HELP_TEXT);
        return null;
    }

    if(argv.v === true || argv.version === true)
    {
        cliService.logVersion();
        return null;
    }

    var commands:string[] = argv._;

    if(commands.length < 2)
    {
        error = Error(ERROR_ARGUMENTS_MISMATCH);
        cliService.logError(error.message);
        throw error;
    }
    else if(commands.length > 2)
    {
        error = new Error(ERROR_INVALID_PROJECT_NAME);
        cliService.logError(error.message);
        throw error;
    }

    var mainCommand:string = commands[0];
    var projectName:string = commands[1];
    var templateName:string = "";

    if((argv.hasOwnProperty("using") && typeof argv.using == "string"))
    {
        templateName = argv.using;
    }
    else if(argv.hasOwnProperty("u") && typeof argv.u == "string")
    {
        templateName = argv.u;
    }


    return {mainCommand:mainCommand,projectName:projectName,templateName:templateName};

}