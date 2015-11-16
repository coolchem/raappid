import {IActionControl} from "../interfaces/comm_system/IActionControl";

export abstract class Service
{

    protected actionControl:IActionControl;


    constructor(actionControl:IActionControl) {
        this.actionControl = actionControl;
    }

    abstract registerActions():void;

    protected call(actionName:string, params:Array<any>):Promise<any>{
        return this.actionControl.call(actionName,params);
    };

    unregisterAction(actionName:string,handler:Function):void{
        this.actionControl.unregisterAction(actionName,handler);
    };

    publish(eventName:string, data?:any):void{
        this.actionControl.publish(eventName,data);
    };
    subscribe(eventName:string,callback: (data: any) => any):void{
        this.actionControl.subscribe(eventName,callback);
    };
    unSubscribe(eventName:string,callback:Function):void{
        this.actionControl.unSubscribe(eventName,callback);
    };
}