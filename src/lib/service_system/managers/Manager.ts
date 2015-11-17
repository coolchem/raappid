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

    protected perform(actionName:string, params:Array<any>):Promise<any>{
        return this.actionControl.perform(actionName,params);
    };

    unregisterAction(actionName:string,handler:Function):void{
        this.actionControl.unregisterAction(actionName,handler);
    };

    publish(eventName:string, data?:any):void{
        this.actionControl.publish(eventName,data);
    };
    subscribe(eventName:string,callback: (data: any) => any):void{
        this.actionControl.subscribe(eventName,callback,this);
    };
    unSubscribe(eventName:string,callback:Function):void{
        this.actionControl.unSubscribe(eventName,callback);
    };
}