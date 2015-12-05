
import {configure as configureSystems} from "./lib/systems";
import {IActionControl} from "./lib/interfaces/comm_system/IActionControl";

var ac:IActionControl = configureSystems();


export var actionControl = ac;

