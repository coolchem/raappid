

import {IActionControl} from "../interfaces/comm_system/IActionControl";
import {IHTTPControl} from "../interfaces/comm_system/IHTTPControl";
import {ActionControl} from "./ActionControl";



export class BaseConfig{

    private _actionControl:IActionControl;
    private _httpControl:IHTTPControl;

    constructor(actionControl:IActionControl) {
        this._actionControl = actionControl;
    }


    get actionControl():IActionControl {
        return this._actionControl;
    }

    get httpControl():IHTTPControl {
        return this._httpControl;
    }
}


export function configure():BaseConfig
{

    var ac:ActionControl = new ActionControl();
    return new BaseConfig(ac);
}
