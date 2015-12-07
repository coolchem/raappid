
export interface IActionControl
{
    registerAction(actionName:string,handler:Function,context?:any):void;
    perform(actionName:string, ...argArray: any[]):Promise<any>;
    unregisterAction(actionName:string,handler:Function):void;

    publish(eventName:string, ...args: any[]):void;
    subscribe(eventName:string,callback: (data: any) => any):void;
    unSubscribe(eventName:string,callback:Function):void;
    hasSubscribers(eventName:string):boolean;
}