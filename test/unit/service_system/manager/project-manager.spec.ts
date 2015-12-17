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

        beforeEach(()=>{
            validateStub= sinon.stub(pa,"validate");
            createRemoteRepositoryStub = sinon.stub(pa,"createRemoteRepository");
            createProjectDirStub = sinon.stub(pa,"createProjectDirectory");
            copyTemplateStub = sinon.stub(pa,"copyTemplate");
            initializeProjectStub = sinon.stub(pa,"initializeProject");
            confirmStub = sinon.stub(cliService,"confirm");

            validateStub.resolves(true);
            createRemoteRepositoryStub.resolves("testProject");
            createProjectDirStub.resolves("tesProjectPath");
            copyTemplateStub.resolves(true);
            initializeProjectStub.resolves(true);
            confirmStub.resolves(true);

        });
        afterEach(()=>{
            validateStub.restore();
            createRemoteRepositoryStub.restore();
            createProjectDirStub.restore();
            copyTemplateStub.restore();
            initializeProjectStub.restore();
            confirmStub.restore();
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

        it("should ask user to create remote repo",(done)=>{

            pm.createProjectCLI("test","testProject").then(()=>{
                expect(createRemoteRepositoryStub).to.have.been.calledOnce;
                done();
            });


        });

        it("should ask user to create local repo, if create remote repo step fails",(done)=>{

            createRemoteRepositoryStub.rejects(new Error("yay"));
            pm.createProjectCLI("test","testProject").then(()=>{
                expect(confirmStub).to.have.been.calledWith(pm.MESSAGE_CONTINUE_WITH_LOCAL_GIT_REPO.replace("#repo-type","GitHub"));
                done();
            });

        });

        it("should reject with error if user decides to not create local repo",(done)=>{

            createRemoteRepositoryStub.rejects(new Error("yay"));
            confirmStub.resolves(false);
            pm.createProjectCLI("test","testProject").then(null,(error)=>{
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal(pm.ERROR_USER_CANCELED_CREATE_PROJECT);
                done();
            });

        });

        it("should create project directory, with remote repo",(done)=>{

            validateStub.resolves(true);
            createRemoteRepositoryStub.resolves("testUsername");
            pm.createProjectCLI("test","testProject").then(()=>{
                expect(createProjectDirStub).to.have.been.calledWith("testProject",{username:"testUsername",repo:"testProject"});
                done();
            });

        });

        it("should create project directory, with local repo",(done)=>{

            validateStub.resolves(true);
            createRemoteRepositoryStub.rejects(false);
            confirmStub.resolves(true);
            pm.createProjectCLI("test","testProject").then(()=>{
                expect(createProjectDirStub).to.have.been.calledWith("testProject");
                done();
            });

        });

        it("should reject with error if create project directory step fails",(done)=>{

            validateStub.resolves(true);
            createRemoteRepositoryStub.rejects(false);
            confirmStub.resolves(true);
            createProjectDirStub.rejects(new Error("yay"));
            pm.createProjectCLI("test","testProject").then(null,(error)=>{

                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("yay");
                done();
            });

        });


        it("should copy template",(done)=>{

            validateStub.resolves(true);
            createRemoteRepositoryStub.rejects(false);
            confirmStub.resolves(true);
            createProjectDirStub.resolves("testDirectory");

            pm.createProjectCLI("test","testProject","humm").then(()=>{
                expect(copyTemplateStub).to.have.been.calledWith("test","testDirectory","humm");
                done();
            });

        });

        it("should reject with error if copy template step fails",(done)=>{

            validateStub.resolves(true);
            createRemoteRepositoryStub.rejects(false);
            confirmStub.resolves(true);
            createProjectDirStub.resolves("testDirectory");
            copyTemplateStub.rejects(new Error("yay"));
            pm.createProjectCLI("test","testProject","humm").then(null,(error)=>{

                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("yay");
                done();
            });

        });

        it("should initialize project and resolve with summary",(done)=>{
            validateStub.resolves(true);
            createRemoteRepositoryStub.rejects(false);
            confirmStub.resolves(true);
            createProjectDirStub.resolves("testDirectory");
            copyTemplateStub.resolves(true);
            initializeProjectStub.resolves(true);
            pm.createProjectCLI("test","testProject","humm").then((result)=>{
                expect(initializeProjectStub).to.have.been.called;
                expect(result).to.be.instanceOf(Array);
                done();
            });
        });

        it("should resolve with summary if the initialize project fails ",(done)=>{
            validateStub.resolves(true);
            createRemoteRepositoryStub.rejects(false);
            confirmStub.resolves(true);
            createProjectDirStub.resolves("testDirectory");
            copyTemplateStub.resolves(true);
            initializeProjectStub.rejects(new Error("yay"));
            pm.createProjectCLI("test","testProject","humm").then((result)=>{
                expect(initializeProjectStub).to.have.been.called;
                expect(result).to.be.instanceOf(Array);
                done();
            });
        });

    });

});




