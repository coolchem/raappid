import {IActionControl} from "../../interfaces/comm_system/IActionControl";

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

    protected subscribe(eventName:string,callback: (data: any) => any):void{
        this.actionControl.subscribe(eventName,callback);
    };
    protected unSubscribe(eventName:string,callback:Function):void{
        this.actionControl.unSubscribe(eventName,callback);
    };

}