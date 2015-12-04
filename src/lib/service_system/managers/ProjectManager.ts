
import {Manager} from "./Manager";
export class ProjectManager extends Manager
{

    protected initialize():void {

        this.registerAction("createProject",this.createProject);
        this.registerAction("initializeProject",this.initializeProject);
    }

    createProject(name:string,parentDirectoryPath:string, projectType:string,repo:string):Promise<any>
    {
        //check if valid project type else throw error

        //if the directory

        //if bare bones project type
            // copy from the resources into directroy
        // else if template is empty look if the default template is in cache
                //if found in cache look if it is the latest version
                      // load it from the directory
                // else get the latest version and delete the older version
        //else
            //download the latest version of the default template into cache

        //copy the contents into then directory

        return null;

    }

    initializeProject(argv:any):Promise<any>
    {
        //check if git installed
            // if not installed warn the user about features that would not work like release

        //check if npm installed and version >=5.0.0 else warn users accordingly


        //run npm install

        // if install script found, run it

        // if setup script found run it..

        //run build script
          //If failed warn user that something might be wrong with the template, contact the template provider with issues

        //run test script
          // If test cases failed warn user, that not all tests are passing, contact the template provider with issues

        // show any special instructions provided by the template owener once project is initialized

        return null;
    }

}