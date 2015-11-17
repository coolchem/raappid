
import {IEventStream} from '../interfaces/comm_system/IEventStream'
import {HandlerObject} from "./HandlerObject";

export class EventStream implements IEventStream
{
    static ERROR_SUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING:string = "Error subscribing to Event: The event name should be of type string";
    static ERROR_SUBSCRIBING_HANDLER_NOT_TYPE_FUNCTION:string = "Error subscribing to Event: The callback should be of type function";

    static ERROR_UNSUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING:string = "Error unsubscribing the Event: The event name should be of type string";
    static ERROR_UNSUBSCRIBING_HANDLER_NOT_TYPE_FUNCTION:string = "Error unsubscribing the Event: The callback should be of type function";

    static ERROR_PUBLISHING_EVENT_NAME_NOT_TYPE_STRING:string = "Error publishing the Event: The event name should be of type string";

    static ERROR_NO_HANDLER_WHILE_SUBSCRIBING:string = "Error subscribing to Event: No Handler set while subscribing to event";
    static ERROR_NO_HANDLER_WHILE_UNSUBSCRIBING:string = "Error unsubscribing the Event: No Handler set while unsubscribing the event";

    protected handlers:any = {};

    publish(eventName:string, data:any = null):void {

        if(!EventStream.isValidEventName(eventName))
            EventStream.throwError(EventStream.ERROR_PUBLISHING_EVENT_NAME_NOT_TYPE_STRING);

        let handlers:Array<HandlerObject>;

        handlers = this.getHandlers(eventName);

        if(handlers)
        {
            for(var i=0; i< handlers.length; i++)
            {
                var handler:HandlerObject = handlers[i];

                handler.handler.call(handler.context,data);
            }

        }

    }

    subscribe(eventName:string, callback:(p1:any)=>any,context?:any):void {

        if(!EventStream.isValidEventName(eventName))
           EventStream.throwError(EventStream.ERROR_SUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

        if(callback === undefined || callback === null)
            EventStream.throwError(EventStream.ERROR_NO_HANDLER_WHILE_SUBSCRIBING);

        if(typeof callback !== 'function')
            EventStream.throwError(EventStream.ERROR_SUBSCRIBING_HANDLER_NOT_TYPE_FUNCTION);


        this.toggleSubscription(eventName,callback,true,context);
    }

    unSubscribe(eventName:string, callback:Function):void {

        if(!EventStream.isValidEventName(eventName))
            EventStream.throwError(EventStream.ERROR_UNSUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

        if(callback === undefined || callback === null)
            EventStream.throwError(EventStream.ERROR_NO_HANDLER_WHILE_UNSUBSCRIBING);

        if(typeof callback !== 'function')
            EventStream.throwError(EventStream.ERROR_UNSUBSCRIBING_HANDLER_NOT_TYPE_FUNCTION);

        this.toggleSubscription(eventName,callback,false);

    }


    unSubscribeAll(eventName:string):void {

        if(!EventStream.isValidEventName(eventName))
            EventStream.throwError(EventStream.ERROR_UNSUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

        this.handlers[eventName] = [];
    }


    hasSubscribers(eventName:string):boolean {

        return this.handlers[eventName] !== undefined && this.handlers[eventName].length > 0;
    }

    protected toggleSubscription(eventName:string,callback:Function,subscribe:boolean,context?:any):void
    {
        let handlers:Array<HandlerObject> = this.getHandlers(eventName);

        for(var i= 0; i<handlers.length ; i++)
        {
            var handler:HandlerObject = handlers[i];

            if(handler.handler === callback)
            {
                if(subscribe === false)
                {
                    handlers.splice(handlers.indexOf(handler),1);
                }

                return;
            }
        }

        handlers.push(new HandlerObject(callback,context));
    }
    protected getHandlers(eventName:string):Array<HandlerObject>
    {
        let handlers:Array<HandlerObject>;

        handlers = this.handlers[eventName];

        if(handlers === null || handlers === undefined)
            this.handlers[eventName] = handlers = [];

        return handlers;
    }



    static throwError(errorMessage:string):void
    {
        throw new Error(errorMessage);
    }

    static isValidEventName(eventName:string):boolean
    {
        return eventName !== undefined && eventName !== null && typeof eventName === 'string';
    }
}
