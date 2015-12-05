
/// <reference path="../../../src/typings/tsd.d.ts" />

import chai = require('chai');
import {ActionControl} from "../../../src/lib/comm_system/ActionControl";
import SinonSpy = Sinon.SinonSpy;
import SinonStub = Sinon.SinonStub;
import SinonMock = Sinon.SinonMock;
import {CLIManager} from "../../../src/lib/service_system/managers/CLIManager";
import {Event} from "../../../src/lib/service_system/service-system";

var fs = require("fs-extra");
var path = require('path');
var sinon = require("sinon");
var minimist = require('minimist');

chai.use(require("sinon-chai"));

function subscribeSpy(ac:ActionControl, action:string):SinonSpy{
    var cb:SinonSpy = sinon.spy();
    ac.subscribe(action,cb);
    return cb
}

function createCLIArguments(args:string):any
{
    return minimist(args.split(" ").slice(1));
}

describe('CLIManager Test cases', () => {

    var ac:ActionControl = new ActionControl();
    var cm:CLIManager = new CLIManager(ac);

    var expect = chai.expect;
    describe('processArguments', () => {

        afterEach(()=>{
           ac = new ActionControl();
           cm = new CLIManager(ac);
        });

        it('should log help when argv.h or argv.help is true', function(done) {

            var cb:SinonSpy = subscribeSpy(ac,Event.LOG);
            var argv:any = createCLIArguments("raappid -h");

            cm.processArguments(argv);

            argv = createCLIArguments("raappid --help");

            cm.processArguments(argv);

            expect(cb).to.have.been.calledWith(CLIManager.CLI_HELP_TEXT).calledTwice;

            done();


        });

        it('should logError and throw error when project-type and project-name not provided', function(done) {

            var cb:SinonSpy = subscribeSpy(ac,Event.LOG_ERROR);

            var argv:any = createCLIArguments("sdfsf");

            var throws = function() {
                cm.processArguments(argv)
            };

            expect(throws).to.throw(CLIManager.ERROR_ARGUMENTS_MISMATCH);
            expect(cb).to.have.been.calledWith(CLIManager.ERROR_ARGUMENTS_MISMATCH);
            done();

        });

        it('should log and throw error when project-name has invalid characters or more than 2 arguments entered from cli', function(done) {

            var cb:SinonSpy = subscribeSpy(ac,Event.LOG_ERROR);

            var argv:any = createCLIArguments("raappid sdfsf sdf sf");

            var throws = function() {
                cm.processArguments(argv)
            };

            expect(throws).to.throw(CLIManager.ERROR_INVALID_PROJECT_NAME);

            argv = createCLIArguments("raappid sdfsf sd?sf");

            expect(throws).to.throw(CLIManager.ERROR_INVALID_PROJECT_NAME);
            expect(cb).to.have.been.calledWith(CLIManager.ERROR_INVALID_PROJECT_NAME).calledTwice;

            done();

        });

        it('should log error and reject with error if not valid project type', function(done) {

            var cb:SinonSpy = subscribeSpy(ac,Event.LOG_ERROR);

            var argv:any = createCLIArguments("raappid sdfsf sdfsf");

            var throws = function() {
                cm.processArguments(argv)
            };

            expect(throws).to.throw(CLIManager.ERROR_INVALID_PROJECT_TYPE);
            expect(cb).to.have.been.calledWith(CLIManager.ERROR_INVALID_PROJECT_TYPE);

            done();
        });

        it('should accept valid project types', function(done) {

            var cb:SinonSpy = subscribeSpy(ac,Event.LOG_ERROR);

            var argv = createCLIArguments("raappid node-app sdfsf");

            var throws = function() {
                cm.processArguments(argv)
            };

            expect(throws).to.not.throw(CLIManager.ERROR_INVALID_PROJECT_TYPE);
            expect(cb).to.not.have.been.calledWith(CLIManager.ERROR_INVALID_PROJECT_TYPE);

            argv = createCLIArguments("raappid web-app sdfsf");
            expect(throws).to.not.throw(CLIManager.ERROR_INVALID_PROJECT_TYPE);
            expect(cb).to.not.have.been.calledWith(CLIManager.ERROR_INVALID_PROJECT_TYPE);

            argv = createCLIArguments("raappid template sdfsf");
            expect(throws).to.not.throw(CLIManager.ERROR_INVALID_PROJECT_TYPE);
            expect(cb).to.not.have.been.calledWith(CLIManager.ERROR_INVALID_PROJECT_TYPE);

            done();
        });

        it('should perform action "createProject" with project-name, project-type', function(done) {

            function createProject()
            {
                return "yay";
            }
            var cb:SinonSpy = sinon.spy(createProject);

            ac.registerAction("createProject",cb);

            var argv:any = createCLIArguments("raappid node-app sdfsf");

            cm.processArguments(argv).then((result)=>{
                expect(cb).to.have.been.calledWith("node-app","sdfsf");
                done();
            });


        });



        it('should process template name when --using is one of the arguments', function(done) {

            function createProject()
            {
                return "yay";
            }

            var cb:SinonSpy = sinon.spy(createProject);

            ac.registerAction("createProject",cb);

            var argv:any = createCLIArguments("raappid node-app sdfsf --using test");

            cm.processArguments(argv).then(()=>{
                expect(cb).to.have.been.calledWith("node-app","sdfsf","test");
                done();
            });

        });

        it('should log error and reject with error thrown by "createProject"', function(done) {

            var cb:SinonSpy = subscribeSpy(ac,Event.LOG_ERROR);
            function createProject()
            {
                throw new Error("yay");
            }
            ac.registerAction("createProject",createProject);

            var argv:any = createCLIArguments("raappid node-app sdfsf");

            cm.processArguments(argv).then(()=>{},(error)=>{

                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("yay");
                expect(cb).to.have.been.calledWithMatch(error);

                done();
            });

        });

        it('should log success and resolve with result from "createProject" ', function(done) {

            var cb:SinonSpy = subscribeSpy(ac,Event.LOG_SUCCESS);

            function createProject()
            {
                return "yay"
            }

            ac.registerAction("createProject",createProject);

            var argv:any = createCLIArguments("raappid node-app sdfsf");

            cm.processArguments(argv).then((result)=>{

                expect(result).to.equal("yay");
                expect(cb).to.have.been.calledWith("yay");
                done();
            });
        });
    });
});




