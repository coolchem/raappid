
export interface IActionControl
{
    registerAction(actionName:string,handler:Function):void;
    call(actionName:string, params:Array<any>):Promise<any>;
    unregisterAction(actionName:string,handler:Function):void;

    publish(eventName:string, data?:any):void;
    subscribe(eventName:string,callback: (data: any) => any):void;
    unSubscribe(eventName:string,callback:Function):void;
    hasSubscribers(eventName:string):boolean;
}