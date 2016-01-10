/// <reference path="../../../typings/tsd.d.ts" />

import fs = require("fs-extra");
import chalk = require('chalk');
import path = require("path");

var read = require("read");
chalk.enabled = true;

export const ERROR_UNSUPPORTED_COLOR:string = `Error logging message: The color sent to log the message unsupported
                                               Please send one of the following colors: red,blue,green,yellow`;

export function logVersion():string
{

    var version:string = JSON.parse(fs.readFileSync(path.resolve("./package.json"), 'utf8')).version;
    log(version);
    return version;
}
export function confirm(question:string,color?:string):Promise<boolean>
{
    var questionNew = question + '[y/n]';

    var promise = askInput(questionNew,false,color);

    return promise.then((answer)=>{
        if (answer.match(/\b(no|n)\b/i))
            return false;
        else if (answer.match(/\b(yes|y\b)/i))
            return true;
        else
            return confirm(question,color);
    });
}

export function askInput(message:string,isPassword=false,color?:string):Promise<string>
{

    return new Promise(function (resolve) {

        var newMessage = message+":";
        if(color)
        {
            newMessage = chalk[color](newMessage).toString();
        }

        read({prompt:newMessage,
            silent:isPassword,
            replace:"*",
            },(error,result)=>{
                resolve(result);
            });
    });
}

export function log(value:string,color?:string):string
{
    if(color && color != "")
    {
        color = color.toLowerCase();

        if(color !== "red" && color !== "blue" && color !== "green" && color !== "yellow")
        {
            throw new Error(ERROR_UNSUPPORTED_COLOR);
        }
        value = chalk[color](value);
    }

    console.log(value);
    return value;
}

export function warn(message:string):string
{
    return log(message,"yellow");
}

export function logError(message:string):string
{
    return log(message,"red");
}

export function logSuccess(message:string):string
{
    return log(message,"green");
}
