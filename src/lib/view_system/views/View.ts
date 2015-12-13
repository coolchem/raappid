import {IActionControl} from "../../interfaces/comm_system/IActionControl";
import {actionControl as ac} from "../../comm_system/index"


export abstract class View{

    protected actionControl:IActionControl;


    constructor(actionControl:IActionControl) {
        this.actionControl = actionControl;
        this.initialize();
    }

    protected abstract initialize():void;

    protected perform(actionName:string, ...argArray: any[]):Promise<any>{
        return this.actionControl.perform(actionName,...argArray);
    };

    protected subscribe(eventName:string,callback:(...args:any[])=>any):void{
        this.actionControl.subscribe(eventName,callback,this);
    };
    protected unSubscribe(eventName:string,callback:Function):void{
        this.actionControl.unSubscribe(eventName,callback);
    };

}