
/// <reference path="../../../typings/tsd.d.ts" />

import fs = require("fs-extra");

export function copyDirectory(directoryPath:string, destDir:string):Promise<boolean>{

    return new Promise((resolve,reject)=>{

        fs.copy(directoryPath,destDir,(error):void=>{
            if (error)
            {
                reject(error);
                return;
            }

            resolve(true);
        })

    });
}

export function createDirectories(names:string[], parentDirectoryPath:string):Promise<boolean>{

    return new Promise((resolve:Function)=>{

        if(names)
        {
            names.forEach((name:string)=>{

                fs.mkdirsSync(parentDirectoryPath+"/"+name);

            })
        }

        resolve(true);
    })
}

export function deleteFiles(filePaths:String[]):Promise<boolean>{

    return new Promise((resolve:Function)=>{

        if(filePaths)
        {
            filePaths.forEach((filePath:string)=>{

                fs.removeSync(filePath);

            })
        }

        resolve(true);
    })
}