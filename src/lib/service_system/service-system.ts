

import {IActionControl} from "../interfaces/comm_system/IActionControl";

export function configure(actionControl:IActionControl):void
{

}

export class Action
{
    static PROCESS_ARGUMENTS:string = "processArguments";
    static CREATE_PROJECT:string = "createProject";
    static INITIALIZE_PROJECT:string = "initProject";

}

export class Event
{
    static LOG:string = "log";
    static LOG_SUCCESS:string = "log_success";
    static LOG_ERROR:string = "log_error";
    static LOG_WARNING:string = "log_warning";

}

