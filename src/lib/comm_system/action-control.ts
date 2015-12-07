
import {IActionControl} from "../interfaces/comm_system/IActionControl"
import {HandlerObject} from "./HandlerObject";
import {EventEmitter} from "events";
import {Errors} from "./index";

class ActionControl extends EventEmitter implements IActionControl
{
    protected actionHandlers:any = {};

    protected getHandler(actionName:string):HandlerObject
    {
        var handlerObject:HandlerObject = this.actionHandlers[actionName];
        if(handlerObject)
        {
            return handlerObject
        }
        return null;
    }

    registerAction(actionName:string, handler:Function,context?:any):void {

        if(!isValidActionOrEventName(actionName))
            throw new Error(Errors.ERROR_REGISTERING_ACTION_NAME_NOT_TYPE_STRING);

        if(handler === undefined || handler === null)
            throw new Error(Errors.ERROR_REGISTERING_ACTION_NO_HANDLER_GIVEN);

        if(typeof handler !== 'function')
            throw new Error(Errors.ERROR_REGISTERING_ACTION_HANDLER_NOT_TYPE_FUNCTION);

        let handler1:HandlerObject = this.getHandler(actionName);

        if(handler1)
            throw new Error(Errors.ERROR_REGISTERING_ACTION_ONLY_ONE_HANDLER_ALLOWED);
        else
            this.actionHandlers[actionName] = new HandlerObject(handler,context);


    }

    perform(actionName:any, ...argArray: any[]):Promise<any> {

        if(!isValidActionOrEventName(actionName))
            throw new Error(Errors.ERROR_TAKING_ACTION_ACTION_NAME_NOT_TYPE_STRING);

        let handler1:HandlerObject = this.getHandler(actionName);

        if(!handler1)
            throw new Error(Errors.ERROR_TAKING_ACTION_NO_HANDLER_REGISTERED);

        var handler:Function = handler1.handler;
        var context:any = handler1.context;
        var promise;
        try {
            promise =  Promise.resolve(handler.call(context,...argArray))
        }
        catch (error)
        {
            return Promise.reject(error)
        }
        return promise;
    }


    unregisterAction(actionName:string, handler:Function):void {
        if(!isValidActionOrEventName(actionName))
            throw new Error(Errors.ERROR_UNREGISTERING_ACTION_NAME_NOT_TYPE_STRING);

        if(handler === undefined || handler === null)
            throw new Error(Errors.ERROR_UNREGISTERING_ACTION_NO_HANDLER_GIVEN);

        if(typeof handler !== 'function')
            throw new Error(Errors.ERROR_UNREGISTERING_ACTION_HANDLER_NOT_TYPE_FUNCTION);

        this.actionHandlers[actionName] = null;
    }

    publish(eventName:string, ...args: any[]):void {

        if(!isValidActionOrEventName(eventName))
            throw new Error(Errors.ERROR_PUBLISHING_EVENT_NAME_NOT_TYPE_STRING);

        this.emit(eventName,...args);

    }

    subscribe(eventName:string, callback:(p1:any)=>any):void {

        if(!isValidActionOrEventName(eventName))
            throw new Error(Errors.ERROR_SUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

        if(callback === undefined || callback === null)
            throw new Error(Errors.ERROR_NO_HANDLER_WHILE_SUBSCRIBING);

        if(typeof callback !== 'function')
            throw new Error(Errors.ERROR_SUBSCRIBING_HANDLER_NOT_TYPE_FUNCTION);

        this.addListener(eventName,callback);

    }


    unSubscribe(eventName:string, callback:Function):void {

        if(!isValidActionOrEventName(eventName))
            throw new Error(Errors.ERROR_UNSUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

        if(callback === undefined || callback === null)
            throw new Error(Errors.ERROR_NO_HANDLER_WHILE_UNSUBSCRIBING);

        if(typeof callback !== 'function')
            throw new Error(Errors.ERROR_UNSUBSCRIBING_HANDLER_NOT_TYPE_FUNCTION);

        this.removeListener(eventName,callback);

    }

    hasSubscribers(eventName:string):boolean {
        return this.listeners(eventName) && this.listeners(eventName).length > 0;
    }
}

function throwError(errorMessage:string):void
{
    throw new Error(errorMessage);
}

function isValidActionOrEventName(eventName:string):boolean
{
    return eventName !== undefined && eventName !== null && typeof eventName === 'string';
}

export default new ActionControl();