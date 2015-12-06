
// execute a single shell command where "cmd" is a string
export function exec(cmd:string,cwd?:string):Promise<boolean>{

    return new Promise((resolve,reject)=>{
        var child_process = require('child_process');
        var parts = cmd.split(/\s+/g);
        var p = child_process.spawn(parts[0], parts.slice(1), getOptions(cwd));

        p.on('exit', function(code){
            var err = null;
            if (code) {
                err = new Error('command "'+ cmd +'" exited with wrong status code "'+ code +'"');
                err.code = code;
                err.cmd = cmd;
                reject(err);
                return;
            }
            resolve(true)
        });
    });

}


// execute multiple commands in series
// this could be replaced by any flow control lib
export function series(cmds:string[],cwd?:string):Promise<any>{

    return new Promise((resolve,reject)=>{
        var execNext = function(){

            exec(cmds.shift(),cwd).then(()=>{

                if (cmds.length)
                    execNext();
                else
                    resolve(true);

            },(error)=>{
                reject(error);
            });
        };
        execNext();
    })

}

function getOptions(cwd?:string):any
{
    var opts:any = {};
    opts.stdio = "inherit";

    if(cwd && cwd !== "")
    {
        opts.cwd = cwd;
    }

    return opts;
}
