/**
 * Created by varunreddy on 12/17/15.
 */

import cm = require("../../../../src/lib/service_system/managers/cli-manager");
import chai = require('chai');

describe('cli-manager Test cases', () => {
    var expect = chai.expect;

    describe("processArguments",()=>{

        it("should throw error if less than 2 commands are passed",()=>{

            var throws:Function = function(){
                cm.processArguments({_:[]});

            };

            expect(throws).to.throw(cm.ERROR_ARGUMENTS_MISMATCH);
        });

        it("should reject with error if more than 2 commands are passed",()=>{

            var throws:Function = function(){
                cm.processArguments({_:["asdad","asdsad","adadad"]})
            };
            expect(throws).to.throw(cm.ERROR_INVALID_PROJECT_NAME);

        });

        it("should return null if user requests help",()=>{

            expect(cm.processArguments({help:true,_:["asdad","asdsad","adadad"]})).to.be.null;
            expect(cm.processArguments({h:true,_:["asdad","asdsad","adadad"]})).to.be.null;
        });

        it("should resolve object containing projectName, projectType and templateName",()=>{

            var result = cm.processArguments({_:["asdad","asdsad"],using:"sdfsfsf"});

            expect(result.projectName).to.equal("asdsad");
            expect(result.projectType).to.equal("asdad");
            expect(result.templateName).to.equal("sdfsfsf");
        });

        it("should resolve object containing projectName, projectType and empty template name",()=>{

            var result = cm.processArguments({_:["asdad","asdsad"]});

            expect(result.projectName).to.equal("asdsad");
            expect(result.projectType).to.equal("asdad");
            expect(result.templateName).to.equal("");
        });

    })
});