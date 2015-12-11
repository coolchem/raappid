/// <reference path="../../../src/typings/tsd.d.ts" />

import chai = require('chai');
import sinon = require('sinon');
import ps =require("../../../src/lib/service_system/services/project-service");
import path = require("path");
import fs = require("fs-extra");
import shell = require("../../../src/lib/service_system/utils/shell-util")
import SinonStub = Sinon.SinonStub;
import SinonSpy = Sinon.SinonSpy;

chai.use(require("sinon-chai"));
require('sinon-as-promised');


describe('project-service Test cases', () => {

    var expect = chai.expect;

    describe('validateProjectType', () => {

        it('should return false if not a valid project type', function(done) {

            expect( ps.validateProjectType("sdfgh")).to.be.false;
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

        it('should return false if not a valid project name', function(done) {

            expect(ps.validateProjectName("sdf?gh")).to.be.false;
            expect(ps.validateProjectName("sdf gh")).to.be.false;

            done();

        });

        it('should return true if a valid project name', function(done) {

            expect(ps.validateProjectName("sdfj")).to.be.true;
            done();

        });

    });

    describe('downloadTemplate', () => {

        var tempProjectDir:string = path.resolve("./test/tempProject");
        var stubExec;

        beforeEach((done)=>{

            stubExec = sinon.stub(shell,"exec");
            fs.mkdirs(tempProjectDir, function (err) {
                fs.writeFileSync(tempProjectDir+"/package.json",JSON.stringify({version:"0.0.1",  devDependencies: {}}, null, '  ') + '\n');

                done();
            })

        });

        afterEach(()=>{
            fs.removeSync(tempProjectDir);

            if(stubExec.restore)
                stubExec.restore();
        });


        it('should download basic template if project type is "basic"', function(done) {

            stubExec.resolves(true);
            ps.downloadTemplate("basic",tempProjectDir).then(()=>{

                expect(stubExec).to.have.been.calledWith("npm install raappid/template-basic", tempProjectDir);

                done();
            });


        });

        it('should download the basic template for each projectType , if templateName is not given', function(done) {

            stubExec.resolves(true);
            ps.downloadTemplate("node-app",tempProjectDir).then(()=>{


                expect(stubExec).to.have.been.calledWith("npm install raappid/template-node-app-basic", tempProjectDir);


                ps.downloadTemplate("web-app",tempProjectDir).then(()=>{

                    expect(stubExec).to.have.been.calledWith("npm install raappid/template-web-app-basic", tempProjectDir);



                    ps.downloadTemplate("template",tempProjectDir).then(()=>{

                        expect(stubExec).to.have.been.calledWith("npm install raappid/template-basic", tempProjectDir);
                        done();
                    });

                });

            });


        });

        it('should download the template to node_modules, if templateName is given', function(done) {

            this.timeout(10000);
            stubExec.restore();
            ps.downloadTemplate("template",tempProjectDir,"raappid/template-basic").then(()=>{

                try {
                    var stats = fs.lstatSync(tempProjectDir+"/node_modules/template-basic");

                    if (stats.isDirectory()) {
                        done();
                    }
                }
                catch (e) {

                    done("Directory Should Have existed\n"+ e);
                }
            });

        });


        it('should reject with error if there was issue with downloading remote template', (done)=> {

            stubExec.rejects(new Error("yay"));
            ps.downloadTemplate("template",tempProjectDir,"raappid/sdfsgdg").then(null,(error)=>{

                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("yay");
                done();
            });


        });

    });

    describe('installDependencies', () => {


        var tempProjectDir:string = path.resolve("./test/tempProject");
        var stubExec:any;
        beforeEach((done)=>{

            stubExec = sinon.stub(shell,"exec");
            fs.mkdirs(tempProjectDir, function (err) {
                fs.writeFileSync(tempProjectDir+"/package.json",JSON.stringify({version:"0.0.1"}, null, '  ') + '\n');
                fs.mkdirsSync(tempProjectDir+"/scripts");
                done();
            })

        });

        afterEach(()=>{
            fs.removeSync(tempProjectDir);

            if(stubExec.restore)
                stubExec.restore();
        });


        it('should do npm install', function(done) {

            stubExec.resolves(true);

            ps.installDependencies(tempProjectDir).then((result)=>{

                expect(stubExec).to.have.calledWith("npm install",tempProjectDir);
                done();

            });

        });


        it('should reject with error if npm install throws error', function(done) {

            stubExec.withArgs("npm install",tempProjectDir).rejects(new Error("humm"));
            ps.installDependencies(tempProjectDir).then((result)=>{
                done("Should never have passed\n");

            },(error)=>{

                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("humm");
                done();
            });
        });

        it('should run the install.js if it is present in the scripts folder', function(done) {

            fs.writeFileSync(tempProjectDir +"/scripts/install.js",
                `
                 console.log('yay')
                `);
            stubExec.resolves(true);
            ps.installDependencies(tempProjectDir).then((result)=> {


                expect(stubExec).to.have.been.calledWith("node " + tempProjectDir + "/scripts/install.js", tempProjectDir);
                done();
            });

        });

        it('should resolve to true if install.js was not found', function(done) {

            stubExec.resolves(true);

            ps.installDependencies(tempProjectDir).then((result)=>{
                expect(result).to.be.true;
                done();

            },(error)=>{
                done("Should not have been rejected\n");
            });
        });

        it('should reject with error if install.js script has error', function(done) {

            stubExec.onCall(0).resolves(true);
            stubExec.onCall(1).rejects(new Error("humm"));

            fs.writeFileSync(tempProjectDir +"/scripts/install.js",
                `
                 console.log('yay')
                `);

            ps.installDependencies(tempProjectDir).then((result)=>{
                done("Should never have passed\n");

            },(error)=>{

                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("humm");
                done();
            });
        });


    });



});




