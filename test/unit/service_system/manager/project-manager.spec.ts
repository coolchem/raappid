/// <reference path="../../../../src/typings/tsd.d.ts" />

import chai = require('chai');
import sinon = require('sinon');
import path = require("path");
import fs = require("fs-extra");

import pm = require("../../../../src/lib/service_system/managers/project-manager");
import pa = require("../../../../src/lib/service_system/assistants/project-assistant");
import cliService = require("../../../../src/lib/service_system/services/cli-service");

import SinonStub = Sinon.SinonStub;
import SinonSpy = Sinon.SinonSpy;

chai.use(require("sinon-chai"));
require('sinon-as-promised');


describe('project-manager Test cases', () => {

    var expect = chai.expect;



    describe("createProjectClI",()=>{


        var validateStub:any;
        var createRemoteRepositoryStub:any;
        var createProjectDirStub:any;
        var copyTemplateStub:any;
        var initializeProjectStub:any;
        var confirmStub:any;
        var configureRemoteRepoStub:any;
        var commitAndPushToRemoteStub:any;

        beforeEach(()=>{
            validateStub= sinon.stub(pa,"validate");
            createRemoteRepositoryStub = sinon.stub(pa,"createRemoteRepository");
            createProjectDirStub = sinon.stub(pa,"createProjectDirectory");
            copyTemplateStub = sinon.stub(pa,"copyTemplate");
            initializeProjectStub = sinon.stub(pa,"initializeProject");
            confirmStub = sinon.stub(cliService,"confirm");
            configureRemoteRepoStub = sinon.stub(pa,"configureRemoteRepo");
            commitAndPushToRemoteStub = sinon.stub(pa,"commitAndPushToRemote");

            validateStub.resolves(true);
            createProjectDirStub.resolves("testProjectPath");
            copyTemplateStub.resolves(true);
            initializeProjectStub.resolves(true);
            confirmStub.resolves(true);
            createRemoteRepositoryStub.resolves({username:"testUser",password:"testPassword",repoName:"testRepo"});
            configureRemoteRepoStub.resolves(true);
            commitAndPushToRemoteStub.resolves(true);

        });
        afterEach(()=>{
            validateStub.restore();
            createRemoteRepositoryStub.restore();
            createProjectDirStub.restore();
            copyTemplateStub.restore();
            initializeProjectStub.restore();
            confirmStub.restore();
            configureRemoteRepoStub.restore();
            commitAndPushToRemoteStub.restore();

        });

        it("should do validation",()=>{

            pm.createProjectCLI("test","testProject").then(()=>{});
            expect(validateStub).to.have.been.calledOnce;

        });

        it("should reject with error, if validation step fails",(done)=>{

            validateStub.rejects(new Error("yay"));
            pm.createProjectCLI("test","testProject").then(null,(error)=>{
                expect(error.message).to.equal("yay");
                done();
            });

        });


        it("should create project directory, with local repo",(done)=>{

            pm.createProjectCLI("test","testProject").then(()=>{
                expect(createProjectDirStub).to.have.been.calledWith("testProject");
                done();
            });

        });

        it("should reject with error if create project directory step fails",(done)=>{

            createProjectDirStub.rejects(new Error("yay"));
            pm.createProjectCLI("test","testProject").then(null,(error)=>{

                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("yay");
                done();
            });

        });


        it("should copy template",(done)=>{

            pm.createProjectCLI("test","testProject","humm").then(()=>{
                expect(copyTemplateStub).to.have.been.calledWith("test","testProjectPath","humm");
                done();
            });

        });

        it("should reject with error if copy template step fails",(done)=>{

            copyTemplateStub.rejects(new Error("yay"));
            pm.createProjectCLI("test","testProject","humm").then(null,(error)=>{

                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("yay");
                done();
            });

        });

        it("should initialize project",(done)=>{

            pm.createProjectCLI("test","testProject","humm").then((result)=>{
                expect(initializeProjectStub).to.have.been.called;
                expect(result).to.be.instanceOf(Array);
                done();
            });
        });

        it("should reject with error if initialize project step fails",(done)=>{

            initializeProjectStub.rejects(new Error("yay"));
            pm.createProjectCLI("test","testProject","humm").then(null,(error)=>{
                expect(initializeProjectStub).to.have.been.called;
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("yay");
                done();
            });
        });


        it("should ask user to create remote repo",(done)=>{

            pm.createProjectCLI("test","testProject").then(()=>{
                expect(createRemoteRepositoryStub).to.have.been.calledOnce;
                done();
            });

        });

        it("should resolve with summary, if user does not want to create remote repo",(done)=>{

            createRemoteRepositoryStub.resolves(false);
            pm.createProjectCLI("test","testProject").then((result)=>{

                expect(result).to.be.instanceOf(Array);
                done();
            });

        });

        it("should resolve with summary, after creating, configuring and pushing to a remote repo",(done)=>{

            pm.createProjectCLI("test","testProject").then((result)=>{
                expect(configureRemoteRepoStub).to.have.been.calledWith("testUser","testPassword","testRepo","testProjectPath").calledOnce;
                expect(commitAndPushToRemoteStub).to.have.been.calledWith("testProjectPath");
                expect(result).to.be.instanceOf(Array);
                done();
            });

        });

        it("should resolve with summary, if create configuring remote repo step fails",(done)=>{

            configureRemoteRepoStub.rejects(new Error("yay"));

            pm.createProjectCLI("test","testProject").then((result)=>{
                expect(result).to.be.instanceOf(Array);
                done();
            });

        });

        it("should resolve with summary, if commit and push step fails",(done)=>{

            commitAndPushToRemoteStub.rejects(new Error("yay"));

            pm.createProjectCLI("test","testProject").then((result)=>{
                expect(result).to.be.instanceOf(Array);
                done();
            });

        });

        it("should resolve with summary, if create remote repo step fails",(done)=>{

            createRemoteRepositoryStub.rejects(new Error("yay"));

            pm.createProjectCLI("test","testProject").then((result)=>{
                expect(result).to.be.instanceOf(Array);
                done();
            });

        });

    });

});




