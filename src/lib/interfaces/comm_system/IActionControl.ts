
export interface IActionControl
{
    registerAction(actionName:string,handler:Function,context?:any):void;
    perform(actionName:string, ...argArray: any[]):Promise<any>;
    unregisterAction(actionName:string,handler:Function):void;

    publish(eventName:string, data?:any):void;
    subscribe(eventName:string,callback: (data: any) => any,context?:any):void;
    unSubscribe(eventName:string,callback:Function):void;
    hasSubscribers(eventName:string):boolean;
}