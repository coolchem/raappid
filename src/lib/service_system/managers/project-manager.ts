
/// <reference path="../../../typings/tsd.d.ts" />


import {Manager} from "./Manager";
import ps = require("../services/project-service");
import fs = require("fs-extra");

export function createProject(name:string,projectType:string,templateName?:string):Promise<any>{

    //check if valid project type else throw error

    //if the directory

    //if bare bones project type
    // copy from the resources into directory
    // else if template is empty look if the default template is in cache
    //if found in cache look if it is the latest version
    // load it from the directory
    // else get the latest version and delete the older version
    //else
    //download the latest version of the default template into cache

    //copy the contents into then directory

    return null;
}
