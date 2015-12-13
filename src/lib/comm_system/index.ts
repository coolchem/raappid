
import {IActionControl} from "../interfaces/comm_system/IActionControl";

export var actionControl:IActionControl = require("./action-control");

export class Errors{
    static ERROR_REGISTERING_ACTION_NAME_NOT_TYPE_STRING:string = "Error registering action: The action name should be of type string";
    static ERROR_REGISTERING_ACTION_HANDLER_NOT_TYPE_FUNCTION:string = "Error registering action: The handler should be of type function";
    static ERROR_REGISTERING_ACTION_NO_HANDLER_GIVEN:string = "Error registering action: No Handler provided while registering to action";
    static ERROR_REGISTERING_ACTION_ONLY_ONE_HANDLER_ALLOWED:string = "Error registering action: Handler already registered for the action." +
        "Only one handler allowed per action";

    static ERROR_UNREGISTERING_ACTION_NAME_NOT_TYPE_STRING:string = "Error un-registering action: The event name should be of type string";
    static ERROR_UNREGISTERING_ACTION_HANDLER_NOT_TYPE_FUNCTION:string = "Error un-registering action: The callback should be of type function";
    static ERROR_UNREGISTERING_ACTION_NO_HANDLER_GIVEN:string = "Error un-registering action: No Handler set while subscribing to event";

    static ERROR_TAKING_ACTION_ACTION_NAME_NOT_TYPE_STRING:string = "Error taking Action: The action name should be of type string";
    static ERROR_TAKING_ACTION_NO_HANDLER_REGISTERED:string = "Error taking Action: No handler registered for the action";

    static ERROR_SUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING:string = "Error subscribing to Event: The event name should be of type string";
    static ERROR_SUBSCRIBING_HANDLER_NOT_TYPE_FUNCTION:string = "Error subscribing to Event: The callback should be of type function";

    static ERROR_UNSUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING:string = "Error unsubscribing the Event: The event name should be of type string";
    static ERROR_UNSUBSCRIBING_HANDLER_NOT_TYPE_FUNCTION:string = "Error unsubscribing the Event: The callback should be of type function";

    static ERROR_PUBLISHING_EVENT_NAME_NOT_TYPE_STRING:string = "Error publishing the Event: The event name should be of type string";

    static ERROR_NO_HANDLER_WHILE_SUBSCRIBING:string = "Error subscribing to Event: No Handler set while subscribing to event";
    static ERROR_NO_HANDLER_WHILE_UNSUBSCRIBING:string = "Error unsubscribing the Event: No Handler set while unsubscribing the event";
}
