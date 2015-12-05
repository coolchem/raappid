/// <reference path="../../../typings/tsd.d.ts" />


import chalk = require('chalk');
chalk.enabled = true;

export const ERROR_UNSUPPORTED_COLOR:string = `Error logging message: The color sent to log the message unsupported
                                               Please send one of the following colors: red,blue,green,yellow`;

export function confirm(question:string):Promise<boolean>
{
    var questionNew = question + '[y/n]';

    var promise = askInput(questionNew);

    return promise.then((answer)=>{
        if (answer.match(/\b(no|n)\b/i))
            return false;
        else if (answer.match(/\b(yes|y\b)/i))
            return true;
        else
            return confirm(question);
    });
}

export function askInput(message:string):Promise<string>
{

    return new Promise(function (resolve) {
        console.log(message+":");
        process.stdin.setEncoding('utf8');
        var inputVal = '';
        process.stdin.on('data', function (data) {
            var lastChar = data.substr(data.length - 1, 1);
            if (lastChar === '\n' || lastChar === '\r' || lastChar === '\u0004') {
                process.stdin.removeAllListeners('data');
                inputVal += data.substr(0, data.length - 1);
                resolve(inputVal.trim());
            }
            inputVal += data;
        });
    });
}

export function log(value:string,color?:string):void
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

}

export function warn(message:string):void
{
    log(message,"yellow");
}

export function logError(message:string):void
{
    log(message,"red");
}

export function logSuccess(message:string):void
{
    log(message,"green");
}
