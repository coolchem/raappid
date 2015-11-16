
import {IActionControl} from "../interfaces/comm_system/IActionControl"
import {IEventStream} from "../interfaces/comm_system/IEventStream"
import {EventStream} from "./EventStream"

export class ActionControl implements IActionControl
{
    static ERROR_REGISTERING_ACTION_NAME_NOT_TYPE_STRING:string = "Error registering action: The action name should be of type string";
    static ERROR_REGISTERING_ACTION_HANDLER_NOT_TYPE_FUNCTION:string = "Error registering action: The handler should be of type function";
    static ERROR_REGISTERING_ACTION_NO_HANDLER_GIVEN:string = "Error registering action: No Handler provided while registering to action";
    static ERROR_REGISTERING_ACTION_ONLY_ONE_HANDLER_ALLOWED:string = "Error registering action: Handler already registered for the action." +
        "Only one handler allowed per action";

    static ERROR_UNREGISTERING_ACTION_NAME_NOT_TYPE_STRING:string = "Error un-registering action: The event name should be of type string";
    static ERROR_UNREGISTERING_ACTION_HANDLER_NOT_TYPE_FUNCTION:string = "Error un-registering action: The callback should be of type function";
    static ERROR_UNREGISTERING_ACTION_NO_HANDLER_GIVEN:string = "Error un-registering action: No Handler set while subscribing to event";

    static ERROR_TAKING_ACTION_ACTION_NAME_NOT_TYPE_STRING:string = "Error taking Action: The action name should be of type string";
    static ERROR_TAKING_ACTION_NO_HANDLER_REGISTERED:string = "Error taking Action: The handler registered for the action";

    static ERROR_SUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING:string = "Error subscribing to Event: The event name should be of type string";
    static ERROR_SUBSCRIBING_HANDLER_NOT_TYPE_FUNCTION:string = "Error subscribing to Event: The callback should be of type function";

    static ERROR_UNSUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING:string = "Error unsubscribing the Event: The event name should be of type string";
    static ERROR_UNSUBSCRIBING_HANDLER_NOT_TYPE_FUNCTION:string = "Error unsubscribing the Event: The callback should be of type function";

    static ERROR_PUBLISHING_EVENT_NAME_NOT_TYPE_STRING:string = "Error publishing the Event: The event name should be of type string";

    static ERROR_NO_HANDLER_WHILE_SUBSCRIBING:string = "Error subscribing to Event: No Handler set while subscribing to event";
    static ERROR_NO_HANDLER_WHILE_UNSUBSCRIBING:string = "Error unsubscribing the Event: No Handler set while unsubscribing the event";

    protected eventStream:IEventStream;

    protected actionHandlers:any = {};

    constructor(eventStream?:IEventStream) {
        this.eventStream = eventStream;

        if(this.eventStream === null || this.eventStream === undefined)
            this.eventStream = new EventStream();
    }

    registerAction(actionName:string, handler:Function):void {

        if(!ActionControl.isValidActionOrEventName(actionName))
            ActionControl.throwError(ActionControl.ERROR_REGISTERING_ACTION_NAME_NOT_TYPE_STRING);

        if(handler === undefined || handler === null)
            ActionControl.throwError(ActionControl.ERROR_REGISTERING_ACTION_NO_HANDLER_GIVEN);

        if(typeof handler !== 'function')
            ActionControl.throwError(ActionControl.ERROR_REGISTERING_ACTION_HANDLER_NOT_TYPE_FUNCTION);

        let handler1:Function = this.actionHandlers[actionName];

        if(handler1)
            ActionControl.throwError(ActionControl.ERROR_REGISTERING_ACTION_ONLY_ONE_HANDLER_ALLOWED);
        else
            this.actionHandlers[actionName] = handler


    }

    call(actionName:any, params:Array<any>):Promise<any> {

        if(!ActionControl.isValidActionOrEventName(actionName))
            ActionControl.throwError(ActionControl.ERROR_TAKING_ACTION_ACTION_NAME_NOT_TYPE_STRING);

        let handler1:Function = this.actionHandlers[actionName];

        if(!handler1)
            ActionControl.throwError(ActionControl.ERROR_TAKING_ACTION_NO_HANDLER_REGISTERED);

        return Promise.resolve(handler1.apply(handler1,params));
    }


    unregisterAction(actionName:string, handler:Function):void {
        if(!ActionControl.isValidActionOrEventName(actionName))
            ActionControl.throwError(ActionControl.ERROR_UNREGISTERING_ACTION_NAME_NOT_TYPE_STRING);

        if(handler === undefined || handler === null)
            ActionControl.throwError(ActionControl.ERROR_UNREGISTERING_ACTION_NO_HANDLER_GIVEN);

        if(typeof handler !== 'function')
            ActionControl.throwError(ActionControl.ERROR_UNREGISTERING_ACTION_HANDLER_NOT_TYPE_FUNCTION);

        this.actionHandlers[actionName] = null;
    }

    publish(eventName:string, data:any):void {

        if(!ActionControl.isValidActionOrEventName(eventName))
            ActionControl.throwError(ActionControl.ERROR_PUBLISHING_EVENT_NAME_NOT_TYPE_STRING);

        this.eventStream.publish(eventName,data);

    }

    subscribe(eventName:string, callback:(p1:any)=>any):void {

        if(!ActionControl.isValidActionOrEventName(eventName))
            ActionControl.throwError(ActionControl.ERROR_SUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

        if(callback === undefined || callback === null)
            ActionControl.throwError(ActionControl.ERROR_NO_HANDLER_WHILE_SUBSCRIBING);

        if(typeof callback !== 'function')
            ActionControl.throwError(ActionControl.ERROR_SUBSCRIBING_HANDLER_NOT_TYPE_FUNCTION);

        this.eventStream.subscribe(eventName,callback);

    }


    unSubscribe(eventName:string, callback:Function):void {

        if(!ActionControl.isValidActionOrEventName(eventName))
            ActionControl.throwError(ActionControl.ERROR_UNSUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

        if(callback === undefined || callback === null)
            ActionControl.throwError(ActionControl.ERROR_NO_HANDLER_WHILE_UNSUBSCRIBING);

        if(typeof callback !== 'function')
            ActionControl.throwError(ActionControl.ERROR_UNSUBSCRIBING_HANDLER_NOT_TYPE_FUNCTION);

        this.eventStream.unSubscribe(eventName,callback);

    }

    hasSubscribers(eventName:string):boolean {
        return this.eventStream.hasSubscribers(eventName);
    }

    static throwError(errorMessage:string):void
    {
        throw new Error(errorMessage);
    }

    static isValidActionOrEventName(eventName:string):boolean
    {
        return eventName !== undefined && eventName !== null && typeof eventName === 'string';
    }
}