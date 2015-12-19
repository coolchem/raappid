/// <reference path="../../../typings/tsd.d.ts" />


import chalk = require('chalk');
chalk.enabled = true;

export const ERROR_UNSUPPORTED_COLOR:string = `Error logging message: The color sent to log the message unsupported
                                               Please send one of the following colors: red,blue,green,yellow`;

export function confirm(question:string,color?:string):Promise<boolean>
{
    var questionNew = question + '[y/n]';

    var promise = askInput(questionNew,color);

    return promise.then((answer)=>{
        if (answer.match(/\b(no|n)\b/i))
            return false;
        else if (answer.match(/\b(yes|y\b)/i))
            return true;
        else
            return confirm(question);
    });
}

export function askInput(message:string,color?:string):Promise<string>
{

    return new Promise(function (resolve) {

        var newMessage = message+":";
        if(color)
        {
            newMessage = chalk[color](newMessage).toString();
        }

        process.stdout.write(newMessage);
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
