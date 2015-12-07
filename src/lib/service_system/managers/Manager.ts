import {IActionControl} from "../../interfaces/comm_system/IActionControl";

export abstract class Manager
{

    protected actionControl:IActionControl;


    constructor(actionControl:IActionControl) {
        this.actionControl = actionControl;
        this.initialize();
    }

    protected abstract initialize():void;

    protected registerAction(actionName:string,handler:Function):void{
        this.actionControl.registerAction(actionName,handler,this);
    };

    protected perform(actionName:string, ...argArray: any[]):Promise<any>{
        return this.actionControl.perform(actionName,...argArray);
    };

    protected unregisterAction(actionName:string,handler:Function):void{
        this.actionControl.unregisterAction(actionName,handler);
    };

    protected publish(eventName:string, data?:any):void{
        this.actionControl.publish(eventName,data);
    };

    protected subscribe(eventName:string,callback: (data: any) => any):void{
        this.actionControl.subscribe(eventName,callback);
    };
    protected unSubscribe(eventName:string,callback:Function):void{
        this.actionControl.unSubscribe(eventName,callback);
    };
}