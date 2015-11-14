

export interface IEventStream
{
    publish(eventName:string, data:any):void;

    subscribe(eventName:string,callback: (data: any) => any):void;

    unSubscribe(eventName:string,callback:Function):void;

    hasSubscribers(eventName:string):boolean;

    unSubscribeAll(eventName:string):void;
}