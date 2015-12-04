
/// <reference path="../../../src/typings/tsd.d.ts" />

import chai = require('chai');
import {AppManager} from "../../../src/lib/service_system/managers/AppManager";
import {ActionControl} from "../../../src/lib/comm_system/ActionControl";
import SinonSpy = Sinon.SinonSpy;
import SinonStub = Sinon.SinonStub;
import SinonMock = Sinon.SinonMock;

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

describe('AppManager Test cases', () => {

    var ac:ActionControl = new ActionControl();
    var am:AppManager = new AppManager(ac);

    var expect = chai.expect;
    describe('processCLIArguments', () => {

        afterEach(()=>{
           ac = new ActionControl();
           am = new AppManager(ac);
        });

        it('should publish "cliLog" when argv.h or argv.help is true', function(done) {

            var cb:SinonSpy = subscribeSpy(ac,"cliLog");
            var argv:any = createCLIArguments("raappid -h");

            am.processCLIArguments(argv);

            argv = createCLIArguments("raappid --help");

            am.processCLIArguments(argv);

            expect(cb).to.have.been.calledWith(AppManager.CLI_HELP_TEXT).calledTwice;

            done();


        });

        it('should publish "cliLogError" when project-type and project-name not provided', function(done) {

            var cb:SinonSpy = subscribeSpy(ac,"cliLogError");

            var argv:any = createCLIArguments("sdfsf");

            var throws = function() {
                am.processCLIArguments(argv)
            };

            expect(throws).to.throw(AppManager.ERROR_ARGUMENTS_MISMATCH);
            expect(cb).to.have.been.calledWith(AppManager.ERROR_ARGUMENTS_MISMATCH);
            done();

        });

        it('should publish "cliLogError" when project-name has invalid characters or more than 2 arguments entered from cli', function(done) {

            var cb:SinonSpy = subscribeSpy(ac,"cliLogError");

            var argv:any = createCLIArguments("raappid sdfsf sdf sf");

            var throws = function() {
                am.processCLIArguments(argv)
            };

            expect(throws).to.throw(AppManager.ERROR_INVALID_PROJECT_NAME);

            argv = createCLIArguments("raappid sdfsf sd?sf");

            console.log(AppManager.ERROR_INVALID_PROJECT_NAME);
            expect(throws).to.throw(AppManager.ERROR_INVALID_PROJECT_NAME);
            expect(cb).to.have.been.calledWith(AppManager.ERROR_INVALID_PROJECT_NAME).calledTwice;

            done();

        });

        it('should publish "cliLogError" and reject with error if not valid project type', function(done) {

            var cb:SinonSpy = subscribeSpy(ac,"cliLogError");

            var argv:any = createCLIArguments("raappid sdfsf sdfsf");

            var throws = function() {
                am.processCLIArguments(argv)
            };

            expect(throws).to.throw(AppManager.ERROR_INVALID_PROJECT_TYPE);
            expect(cb).to.have.been.calledWith(AppManager.ERROR_INVALID_PROJECT_TYPE);

            done();
        });

        it('should accept valid project types', function(done) {

            var cb:SinonSpy = subscribeSpy(ac,"cliLogError");

            var argv = createCLIArguments("raappid node-app sdfsf");

            var throws = function() {
                am.processCLIArguments(argv)
            };

            expect(throws).to.not.throw(AppManager.ERROR_INVALID_PROJECT_TYPE);
            expect(cb).to.not.have.been.calledWith(AppManager.ERROR_INVALID_PROJECT_TYPE);

            argv = createCLIArguments("raappid web-app sdfsf");
            expect(throws).to.not.throw(AppManager.ERROR_INVALID_PROJECT_TYPE);
            expect(cb).to.not.have.been.calledWith(AppManager.ERROR_INVALID_PROJECT_TYPE);

            argv = createCLIArguments("raappid template sdfsf");
            expect(throws).to.not.throw(AppManager.ERROR_INVALID_PROJECT_TYPE);
            expect(cb).to.not.have.been.calledWith(AppManager.ERROR_INVALID_PROJECT_TYPE);

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

            am.processCLIArguments(argv).then((result)=>{
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

            am.processCLIArguments(argv).then(()=>{
                expect(cb).to.have.been.calledWith("node-app","sdfsf","test");
                done();
            });

        });

        it('should publish "cliLogError" and reject with error thrown by "createProject"', function(done) {

            var cb:SinonSpy = subscribeSpy(ac,"cliLogError");
            function createProject()
            {
                throw new Error("yay");
            }
            ac.registerAction("createProject",createProject);

            var argv:any = createCLIArguments("raappid node-app sdfsf");

            am.processCLIArguments(argv).then(()=>{},(error)=>{

                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("yay");
                expect(cb).to.have.been.calledWithMatch(error);

                done();
            });

        });

        it('should publish "cliLogSuccess" and resolve with result from "createProject" ', function(done) {

            var cb:SinonSpy = subscribeSpy(ac,"cliLogSuccess");

            function createProject()
            {
                return "yay"
            }

            ac.registerAction("createProject",createProject);

            var argv:any = createCLIArguments("raappid node-app sdfsf");

            am.processCLIArguments(argv).then((result)=>{

                expect(result).to.equal("yay");
                expect(cb).to.have.been.calledWith("yay");
                done();
            });
        });
    });
});




