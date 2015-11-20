/**
 * Created by varunreddy on 11/19/15.
 */

import {View} from "./View";

export class CmdView extends View
{

    protected initialize():void {

        this.subscribe("showError",this.showError);
        this.actionControl.registerAction("confirm",this.confirm,this);
        this.actionControl.registerAction("askInput",this.askInput,this);
    }

    processArguments(argv:any):void
    {
        this.perform("processArguments",argv);
    }

    confirm(question:string):Promise<string>
    {
        return null;
    }

    askInput(message:string):Promise<string>
    {
        return null;
    }

    log(value:string):void
    {

    }

    warn(message:string):void
    {

    }

    showError(message:string):void
    {

    }
}