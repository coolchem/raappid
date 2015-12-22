/**
 * Created by varunreddy on 12/16/15.
 */


import chai = require('chai');
import sinon = require('sinon');
import ps =require("../../../../src/lib/service_system/services/project-service");
import repoService = require("../../../../src/lib/service_system/services/repo-service");
import path = require("path");
import fs = require("fs-extra");
import shell = require("../../../../src/lib/service_system/utils/shell-util");
import cliService = require("../../../../src/lib/service_system/services/cli-service")

import pa = require("../../../../src/lib/service_system/assistants/project-assistant");


import SinonStub = Sinon.SinonStub;
import SinonSpy = Sinon.SinonSpy;

chai.use(require("sinon-chai"));
require('sinon-as-promised');

describe('project-assistant Test cases', () => {

    var expect = chai.expect;

    describe('validate', () => {


        it('should reject with error if Git not installed on the system', function(done) {

            var stub:SinonStub = sinon.stub(repoService,"validateGit");
            stub.returns(false);
            pa.validate("node-app","asdad").catch((error)=>{
                stub.restore();
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal(pa.ERROR_GIT_NOT_INSTALLED);
                done();
            });
        });

        it('should reject with error if not valid project type', function(done) {

            pa.validate("asdada","asdad").catch((error)=>{
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal(pa.ERROR_INVALID_PROJECT_TYPE);
                done();
            });
        });

        it('should reject with error if not valid project name', function(done) {

            pa.validate("node-app","as?ad").catch((error)=>{
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal(pa.ERROR_INVALID_PROJECT_NAME);
                done();
            });
        });


        it('should resolve to true if everything checks out', function(done) {

            pa.validate("node-app","asdad").then((result)=>{
                expect(result).to.be.true;
                done();
            });
        });

    });

    describe("createRemoteRepository", ()=>{

        var confirmStub:any;
        var askStub:any;
        var logErrorSpy:SinonSpy;
        var logSpy:SinonSpy;
        var createRemoteRepositoryStub:any;
        beforeEach(()=>{

            logErrorSpy = sinon.spy(cliService,"logError");
            logSpy = sinon.spy(cliService,"log");
            createRemoteRepositoryStub = sinon.stub(repoService,"createRemoteRepository");
            confirmStub = sinon.stub(cliService,"confirm");
            askStub = sinon.stub(cliService,"askInput");
            confirmStub.resolves(true);
            askStub.resolves("test");
        });

        afterEach(()=>{

            logErrorSpy.restore();
            logSpy.restore();
            createRemoteRepositoryStub.restore();
            confirmStub.restore();
            askStub.restore();

        });

        it('should confirm with user to create github repository', function(done) {

            confirmStub.resolves(false);
            pa.createRemoteRepository("humm").then((result)=>{
                expect(confirmStub).to.have.been.calledWith(pa.MESSAGE_CREATE_REMOTE_REPO.replace("#repo-type","GitHub"));
                done();
            });

        });

        it('should resolve with null if user answers no', function(done) {

            confirmStub.resolves(false);
            pa.createRemoteRepository("humm").then((result)=>{
                expect(result).to.be.null;
                done();
            });
        });

        it('should ask user for credentials and create repository', function(done) {


            createRemoteRepositoryStub.resolves({});

            pa.createRemoteRepository("humm").then((result)=>{
                expect(createRemoteRepositoryStub).to.have.been.called;
                expect(askStub).to.have.been.calledWith("Enter Username");
                expect(askStub).to.have.been.calledWith("Enter Password");

                expect(result.username).to.equal("test");
                expect(result.repoName).to.equal("humm");
                done();
            });
        });

        it('should ask user to re enter credentials, if create repository fails with bad credentials', function(done) {

            createRemoteRepositoryStub.onFirstCall().rejects({code:401});
            createRemoteRepositoryStub.onSecondCall().resolves(true);

            pa.createRemoteRepository("humm").then(()=>{

                expect(logErrorSpy).to.have.been.calledWith(pa.ERROR_CREATING_REPO_BAD_CREDENTIALS.replace("#repo-type","GitHub"));
                expect(logSpy).to.have.been.calledWith(pa.MESSAGE_RE_ENTER_CREDENTIALS);
                done();
            });

        });

        it('should reject, if create repository fails with bad credentials 3 times times', function(done) {

            createRemoteRepositoryStub.onFirstCall().rejects({code:401});
            createRemoteRepositoryStub.onSecondCall().rejects({code:401});
            createRemoteRepositoryStub.onThirdCall().rejects({code:401});

            pa.createRemoteRepository("humm").then(null,(error)=>{

                expect(createRemoteRepositoryStub).to.have.been.calledThrice;
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal(pa.ERROR_CREATING_REMOTE_REPO);
                done();
            });

        });

        it('should ask user to choose a new repo name, if the repo already exists', function(done) {

            createRemoteRepositoryStub.onFirstCall().rejects({code:422,message:'{"message":"Validation Failed"}'});
            createRemoteRepositoryStub.onSecondCall().resolves({});

            pa.createRemoteRepository("humm").then((result)=>{

                expect(logErrorSpy).to.have.been.calledWith(pa.MESSAGE_REPO_NAME_ALREADY_EXISTS.replace("#repo-type","GitHub").replace("#repo-name","humm"));
                expect(logSpy).to.have.been.calledWith(pa.MESSAGE_ENTER_REPO_NAME);
                done();
            });

        });

        it('should reject after 3 attempts at creating repository with a new repo name', function(done) {

            createRemoteRepositoryStub.onFirstCall().rejects({code:422,message:'{"message":"Validation Failed"}'});
            createRemoteRepositoryStub.onSecondCall().rejects({code:422,message:'{"message":"Validation Failed"}'});
            createRemoteRepositoryStub.onThirdCall().rejects({code:422,message:'{"message":"Validation Failed"}'});

            pa.createRemoteRepository("humm").then(null,(error)=>{
                expect(createRemoteRepositoryStub).to.have.been.calledThrice;
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal(pa.ERROR_CREATING_REMOTE_REPO);
                done();
            });

        });

        it('should reject, if create repository fails for any  other reasons', function(done) {

            createRemoteRepositoryStub.rejects({code:433,message:'{"message":"Validation Failed"}'});

            pa.createRemoteRepository("humm").then(null,(error)=>{
                expect(createRemoteRepositoryStub).to.have.been.calledOnce;
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal(pa.ERROR_CREATING_REMOTE_REPO);
                done();
            });

        });

    });

    describe("createProjectDirectory",()=>{

        var mkdirStub:SinonStub;
        var gitInitStub:any;

        beforeEach(()=>{
            mkdirStub = sinon.stub(fs,"emptyDirSync");
            gitInitStub = sinon.stub(repoService,"initializeGit");
        });

        afterEach(()=>{
            mkdirStub.restore();
            gitInitStub.restore();
        });


        it("should create directory with project name and do git init",(done)=>{

            mkdirStub.returns(null);
            gitInitStub.resolves(true);
            pa.createProjectDirectory("test").then(()=>{

                expect(mkdirStub).to.have.been.calledWith(process.cwd()+"/test");
                done();
            });
        })


    });

    describe("copyTemplate",()=>{

        var downloadStub:any;
        var copyStub:SinonStub;
        var writeFileSyncStub:any;
        var removeSyncStub:any;

        beforeEach(()=>{
            downloadStub = sinon.stub(ps,"downloadTemplate");
            copyStub = sinon.stub(fs,"copySync");
            writeFileSyncStub = sinon.stub(fs,"writeFileSync");
            removeSyncStub = sinon.stub(fs,"removeSync");

            writeFileSyncStub.returns(true);
            removeSyncStub.returns(true);
        });

        afterEach(()=>{
            downloadStub.restore();
            copyStub.restore();
            writeFileSyncStub.restore();
            removeSyncStub.restore();
        });

        it("should download template and return template path",(done)=>{

            downloadStub.resolves("testTemplatePath");
            copyStub.returns(null);
            pa.copyTemplate("node-app","test","testTemplate").then(()=>{

                expect(downloadStub).to.have.been.calledWith("node-app","test","testTemplate");
                expect(copyStub).to.have.been.calledWith("testTemplatePath");
                done();
            });

        });


    });

    describe("initializeProject",()=>{

        var sanitizeStub:any;
        var instalDepsStup:any;
        var shrinkWrapStub:any;

        beforeEach(()=>{
            sanitizeStub = sinon.stub(ps,"sanitizePackage");
            instalDepsStup = sinon.stub(ps,"installDependencies");
            shrinkWrapStub = sinon.stub(ps,"shrinkWrapDependencies");

            sanitizeStub.returns({});
            instalDepsStup.resolves(true);
            shrinkWrapStub.resolves(true);
        });

        afterEach(()=>{
            sanitizeStub.restore();
            instalDepsStup.restore();
            shrinkWrapStub.restore();
        });

        it("should sanitize the package.json",(done)=>{


            pa.initializeProject("test","testDirectory").then(()=>{

                expect(sanitizeStub).to.have.been.calledWith("test","testDirectory").calledOnce;
                done()
            });

        });

        it("should install project dependencies",(done)=>{

            pa.initializeProject("test","testDirectory").then(()=>{

                expect(instalDepsStup).to.have.been.calledWith("testDirectory").calledOnce;
                done();
            });
        });


        it("should reject with error if any issue with installing dependencies",(done)=>{

            instalDepsStup.rejects(new Error("yay"));
            pa.initializeProject("test","testDirectory").then(null,(error)=>{
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("yay");
                done()
            });
        });

        it("should do shrinkwrap",(done)=>{

            pa.initializeProject("test","testDirectory").then(()=>{

                expect(shrinkWrapStub).to.have.been.calledWith("testDirectory").calledOnce;
                done();
            });
        });


        it("should reject with error if any issue with shrinkwrapping",(done)=>{

            shrinkWrapStub.rejects(new Error("yay"));
            pa.initializeProject("test","testDirectory").then(null,(error)=>{
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("yay");
                done()
            });
        });


    });
});