
/// <reference path="../../../typings/tsd.d.ts" />


export class FileSystemService
{
    protected fs = require("fs-extra");


    copyDirectory(directoryPath:string, destDir:string):Promise<boolean>{

        return new Promise((resolve:Function)=>{

            this.fs.copy(directoryPath,destDir,(error):void=>{
                if (error)
                {
                    throw error;
                }

                resolve(true);
            })

        });
    }

    createDirectories(names:string[], parentDirectoryPath:string):Promise<boolean>{

        return new Promise((resolve:Function)=>{

            if(names)
            {
                names.forEach((name:string)=>{

                    this.fs.mkdirsSync(parentDirectoryPath+"/"+name);

                })
            }

            resolve(true);
        })
    }


    deleteFiles(filePaths:String[]):Promise<boolean>{

        return new Promise((resolve:Function)=>{

            if(filePaths)
            {
                filePaths.forEach((filePath:string)=>{

                    this.fs.removeSync(filePath);

                })
            }

            resolve(true);
        })
    }
}