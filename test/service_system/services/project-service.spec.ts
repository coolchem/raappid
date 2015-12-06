/// <reference path="../../../src/typings/tsd.d.ts" />

import chai = require('chai');
import sinon = require('sinon');
import ps =require("../../../src/lib/service_system/services/project-service");
import path = require("path");
import fs = require("fs-extra");
import shell = require("../../../src/lib/service_system/utils/shell-util")

chai.use(require("sinon-chai"));
require('sinon-as-promised');

describe('project-service Test cases', () => {

    var expect = chai.expect;

    describe('validateProjectType', () => {

        it('should return error if not a valid project type', function(done) {

            var valid:boolean|Error = ps.validateProjectType("sdfgh");

            expect(valid).to.be.instanceOf(Error);
            expect((valid as Error).message).to.equal(ps.ERROR_INVALID_PROJECT_TYPE);
            done();

        });

        it('should return true if a valid project type', function(done) {

            expect(ps.validateProjectType("node-app")).to.be.true;
            expect(ps.validateProjectType("web-app")).to.be.true;
            expect(ps.validateProjectType("template")).to.be.true;
            expect(ps.validateProjectType("basic")).to.be.true;
            done();

        });

    });

    describe('validateProjectName', () => {

        it('should return Error if not a valid project name', function(done) {

            var valid:boolean|Error = ps.validateProjectName("sdf?gh");

            expect(valid).to.be.instanceOf(Error);
            expect((valid as Error).message).to.equal(ps.ERROR_INVALID_PROJECT_NAME);

            valid = ps.validateProjectName("sdf gh");

            expect(valid).to.be.instanceOf(Error);
            expect((valid as Error).message).to.equal(ps.ERROR_INVALID_PROJECT_NAME);

            done();

        });

        it('should return true if a valid project name', function(done) {

            expect(ps.validateProjectName("sdfj")).to.be.true;
            done();

        });

    });

    describe('initializeProject', () => {


        var tempProjectDir:string = path.resolve("./test/tempProject");
        var spyExec;

        beforeEach((done)=>{

            spyExec = sinon.spy(require('../../../src/lib/service_system/utils/shell-util'),"exec");
            fs.mkdirs(tempProjectDir, function (err) {
                fs.writeFileSync(tempProjectDir+"/package.json",JSON.stringify({version:"0.0.1",  devDependencies: {"typescript": "^1.7"}}, null, '  ') + '\n');
                fs.mkdirsSync(tempProjectDir+"/scripts");
                done();
            })

        });

        afterEach(()=>{
            fs.removeSync(tempProjectDir);

            if(spyExec.restore)
                spyExec.restore();
        });


        it('should do npm install if no install.js is present in the scripts folder', function(done) {

            ps.initializeProject(tempProjectDir).then((result)=>{

                try {
                    var stats = fs.lstatSync(tempProjectDir+"/node_modules");

                    // Is it a directory?
                    if (stats.isDirectory()) {
                        done();
                    }
                }
                catch (e) {

                    done("Directory Should Have existed\n"+ e);
                }

            },(error)=>{

                done("Should never have thrown error\n");
            });



        });

        it('should run the install.js if it is present in the scripts folder', function(done) {

            fs.writeFileSync(tempProjectDir +"/scripts/install.js",
                `
                 var fs = require("fs");
                 fs.writeFileSync("temp.text");
                `);

            ps.initializeProject(tempProjectDir).then((result)=>{

                try {
                    var stats = fs.lstatSync(tempProjectDir+"/temp.text");

                    if (stats.isFile()) {
                        done();
                    }
                    else
                    {
                        done("File Should Have existed\n")
                    }
                }
                catch (e) {

                    done("File Should Have existed\n"+ e);
                }
            },(error)=>{

                done("Should never have thrown error\n" + error);
            });

        });

        it('should  do npm install if install script is run but did not do npm install', function(done) {

            fs.writeFileSync(tempProjectDir +"/scripts/install.js",
                `
                 console.log('yay')
                `);

            ps.initializeProject(tempProjectDir).then((result)=>{

                try {
                    var stats = fs.lstatSync(tempProjectDir+"/node_modules");

                    if (stats.isDirectory()) {
                        done();
                    }
                }
                catch (e) {

                    done("Directory Should Have existed\n"+ e);
                }

            },(error)=>{

                done("Should never have thrown error\n" + error);
            });

        });

        it('should not do npm install if install script is run, which also ran npm install', function(done) {



            fs.writeFileSync(tempProjectDir +"/scripts/install.js",`
             var execSync = require('child_process').execSync;

             execSync("npm install");

             console.log('yay');

             process.exit(0)
            `);

            ps.initializeProject(tempProjectDir).then((result)=>{

                expect(spyExec).to.have.been.calledOnce;

                try {
                    var stats = fs.lstatSync(tempProjectDir+"/node_modules");

                    if (stats.isDirectory()) {
                        done();
                    }
                }
                catch (e) {

                    done("Directory Should Have existed\n"+ e);
                }

            },(error)=>{

                done("Should never have thrown error\n");
            });
        });

        it('should reject with error if install.js script has error', function(done) {

            fs.writeFileSync(tempProjectDir +"/scripts/install.js",`
             var execSync = require('child_process').execSync;

             execSync("node eertetet");

             process.exit(0)
            `);

            ps.initializeProject(tempProjectDir).then((result)=>{


                done("Should never have passed\n");

            },(error)=>{

                expect(spyExec).to.have.been.calledOnce;
                expect(error).to.be.instanceOf(Error);
                done();
            });
        });

        it('should reject with error if no install script was found and npm install throws error', function(done) {

            spyExec.restore();
            var shellStub:any = sinon.stub(shell,"exec");
            shellStub.rejects(new Error("humm"));

            ps.initializeProject(tempProjectDir).then((result)=>{

                shellStub.restore();
                done("Should never have passed\n");

            },(error)=>{

                expect(shellStub).to.have.been.calledOnce;
                expect(error).to.be.instanceOf(Error);
                shellStub.restore();
                done();
            });
        });

        it('should reject with error if install script was found and npm install throws error', function(done) {

            spyExec.restore();
            var shellStub:any = sinon.stub(shell,"exec");
            shellStub.onCall(0).resolves(true);
            shellStub.onCall(1).rejects(new Error("humm"));
            fs.writeFileSync(tempProjectDir +"/scripts/install.js",
                `
                 console.log('yay')
                `);

            ps.initializeProject(tempProjectDir).then((result)=>{
                shellStub.restore();
                done("Should never have passed\n");

            },(error)=>{

                expect(shellStub).to.have.been.calledTwice;
                expect(error).to.be.instanceOf(Error);
                shellStub.restore();
                done();
            });
        });

    });



});




