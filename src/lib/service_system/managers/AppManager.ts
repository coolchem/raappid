


import {Manager} from "./Manager";
export class AppManager extends Manager
{

    protected initialize():void {

        this.registerAction("processArguments",this.processArguments)
    }

    protected processArguments(argv:any):void
    {
        //check if --help or -h show instructions and exit
        if(argv.help === true || argv.h === true)
        {

        }
        else
        {
            var projectType:string;
            var template:string;

            //if the arguments ar valid
            this.perform("createProject",projectType,template).then(()=>{

            },(error)=>{

                this.publish("showError",error);
                process.exit(1);
            });
        }
    }


}
