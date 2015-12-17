

//importing managers
import pm = require("./managers/project-manager");
import cm = require("./managers/cli-manager");

import {actionControl} from "../comm_system/index"

export class Action
{
    static PROCESS_ARGUMENTS:string = "processArguments";
    static CREATE_PROJECT_CLI:string = "createProjectCLI";
}

export class Event
{
    static LOG:string = "log";
    static LOG_SUCCESS:string = "log_success";
    static LOG_ERROR:string = "log_error";
    static LOG_WARNING:string = "log_warning";

}

//register actions
actionControl.registerAction(Action.PROCESS_ARGUMENTS,cm.processArguments);
actionControl.registerAction(Action.CREATE_PROJECT_CLI,pm.createProjectCLI);
