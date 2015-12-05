
/// <reference path="../typings/tsd.d.ts" />

import commSystem = require("./comm_system/comm-system");
import viewSystem = require("./view_system/view-system");
import serviceSystem = require("./service_system/service-system");
import {BaseConfig} from "./comm_system/comm-system";
import {IActionControl} from "./interfaces/comm_system/IActionControl";

var conFig:BaseConfig = commSystem.configure();

export function configure():IActionControl
{
    serviceSystem.configure(conFig.actionControl);
    viewSystem.configure(conFig.actionControl);

    return conFig.actionControl;
}