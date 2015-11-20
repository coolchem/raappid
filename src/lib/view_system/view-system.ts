

import {IActionControl} from "../interfaces/comm_system/IActionControl";
import {View} from "./views/View";

var actionControl:IActionControl;

export function configure(ac:IActionControl):void
{
    actionControl = ac;

}

export function createView(view):any
{
    return new view(actionControl);
}
