
export interface IActionControl
{
    registerAction(actionName:string,handler:Function):void;
    takeAction(actionName:string, params:Array<any>):Promise;
    unregisterAction(actionName:string,handler:Function):void;

    publish(eventName:string, data?:any):void;
    subscribe(eventName:string,callback: (data: any) => any):void;
    unSubscribe(eventName:string,callback:Function):void;
    unSubscribeAll(eventName:string):void;
    hasSubscribers(eventName:string):boolean;
}