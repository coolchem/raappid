

import {IActionControl} from "../interfaces/comm_system/IActionControl";
import {IHTTPControl} from "../interfaces/comm_system/IHTTPControl";
import {ActionControl} from "./ActionControl";



export class BaseConfig{

    private _actionControl:IActionControl;
    private _httpControl:IHTTPControl;

    constructor(actionControl:IActionControl, httpControl:IHTTPControl) {
        this._actionControl = actionControl;
        this._httpControl = httpControl;
    }


    get actionControl():IActionControl {
        return this._actionControl;
    }

    get httpControl():IHTTPControl {
        return this._httpControl;
    }
}


export function configure():void
{

    var ac:ActionControl = new ActionControl()
}
