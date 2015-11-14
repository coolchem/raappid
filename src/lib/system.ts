
/// <reference path="../typings/tsd.d.ts" />

import commSystem = require("./comm_system/comm-system");
import viewSystem = require("./view_system/view-system");
import serviceSystem = require("./service_system/service-system");
import {BaseConfig} from "./comm_system/comm-system";

export function configure():void
{

    var conFig:BaseConfig = commSystem.configure();

    serviceSystem.configure(conFig.actionControl);

    viewSystem.configure(conFig.actionControl);

}