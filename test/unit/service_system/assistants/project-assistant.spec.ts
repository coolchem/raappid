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
        var logErrorSpy:SinonSpy = sinon.spy(cliService,"logError");
        var logSpy:SinonSpy = sinon.spy(cliService,"log");
        beforeEach(()=>{
            confirmStub = sinon.stub(cliService,"confirm");
            askStub = sinon.stub(cliService,"askInput");
        });

        afterEach(()=>{

            if(confirmStub.restore)
                confirmStub.restore();
            if(askStub.restore)
                askStub.restore();
        });

        it('should confirm with user to create github repository', function(done) {

            confirmStub.resolves(false);
            pa.createRemoteRepository("humm").then(()=>{});
            expect(confirmStub).to.have.been.calledWith(pa.MESSAGE_CREATE_REMOTE_REPO.replace("#repo-type","GitHub"));
            done();
        });

        it('should resolve with false if user answers no', function(done) {

            confirmStub.resolves(false);
            pa.createRemoteRepository("humm").then((result)=>{
                expect(result).to.be.false;
                done();
            });


        });

        it('should ask user for credentials and create repository', function(done) {

            confirmStub.withArgs("Would like to create a GitHub repository for your project?").resolves(true);
            askStub.withArgs("Enter Username").resolves("test");
            askStub.withArgs("Enter Password").resolves("test");

            var repoStub:any = sinon.stub(repoService,"createRemoteRepository");
            repoStub.resolves({});

            pa.createRemoteRepository("humm").then(()=>{
                expect(repoStub).to.have.been.called;
                expect(askStub).to.have.been.calledWith("Enter Username");
                expect(askStub).to.have.been.calledWith("Enter Password");
                repoStub.restore();
                done();
            });
        });

        it('should ask user to re enter credentials, if create repository fails with bad credentials', function(done) {

            var stub1 = askStub.withArgs("Enter Username").resolves("test");
            var stub2 = askStub.withArgs("Enter Password").resolves("test");
            confirmStub.resolves(true);

            var repoStub:any = sinon.stub(repoService,"createRemoteRepository");
            repoStub.onFirstCall().rejects({code:401});
            repoStub.onSecondCall().resolves(true);

            pa.createRemoteRepository("humm").then(()=>{

                expect(logErrorSpy).to.have.been.calledWith(pa.ERROR_CREATING_REPO_BAD_CREDENTIALS.replace("#repo-type","GitHub"));
                expect(logSpy).to.have.been.calledWith(pa.MESSAGE_RE_ENTER_CREDENTIALS);

                expect(stub1).to.have.been.calledWith("Enter Username").calledTwice;
                expect(stub2).to.have.been.calledWith("Enter Password").calledTwice;
                repoStub.restore();

                done();
            });

        });

        it('should reject, if create repository fails with bad credentials 2nd time', function(done) {

            var stub1 = askStub.withArgs("Enter Username").resolves("test");
            var stub2 = askStub.withArgs("Enter Password").resolves("test");
            confirmStub.resolves(true);

            var repoStub:any = sinon.stub(repoService,"createRemoteRepository");
            repoStub.onFirstCall().rejects({code:401});
            repoStub.onSecondCall().rejects({code:401});

            pa.createRemoteRepository("humm").then(null,(error)=>{

                expect(stub1).to.have.been.calledWith("Enter Username").calledTwice;
                expect(stub2).to.have.been.calledWith("Enter Password").calledTwice;
                repoStub.restore();

                done();
            });

        });

        it('should reject, if create repository fails for any  other reasons', function(done) {

            var stub1 = askStub.withArgs("Enter Username").resolves("test");
            var stub2 = askStub.withArgs("Enter Password").resolves("test");
            confirmStub.resolves(true);

            var repoStub:any = sinon.stub(repoService,"createRemoteRepository");
            repoStub.rejects({});

            pa.createRemoteRepository("humm").then(null,(error)=>{

                expect(stub1).to.have.been.calledWith("Enter Username").calledOnce;
                expect(stub2).to.have.been.calledWith("Enter Password").calledOnce;
                repoStub.restore();

                done();
            });

        });


    });

    describe("createProjectDirectory",()=>{

        var cloneStub:any;
        var mkdirStub:SinonStub;
        var gitInitStub:any;

        beforeEach(()=>{
            cloneStub = sinon.stub(repoService,"cloneGitRepository");
            mkdirStub = sinon.stub(fs,"mkdirsSync");
            gitInitStub = sinon.stub(repoService,"initializeGit");
        });

        afterEach(()=>{
            cloneStub.restore();
            mkdirStub.restore();
            gitInitStub.restore();
        });

        it("should clone repository if remoteRepo is given",(done)=>{

            cloneStub.resolves(true);
            pa.createProjectDirectory("test",{username:"test",repo:"test"}).then(()=>{

                expect(cloneStub).to.have.been.calledWith("test","test",process.cwd());
                done();
            });

        });

        it("should create directory with project name and do git init, if remote repo is not present",(done)=>{


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

        beforeEach(()=>{
            downloadStub = sinon.stub(ps,"downloadTemplate");
            copyStub = sinon.stub(fs,"copySync");
        });

        afterEach(()=>{
            downloadStub.restore();
            copyStub.restore();
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

        beforeEach(()=>{
            sanitizeStub = sinon.stub(ps,"sanitizePackageJson");
            instalDepsStup = sinon.stub(ps,"installDependencies");
        });

        afterEach(()=>{
            sanitizeStub.restore();
            instalDepsStup.restore();
        });

        it("should sanitize the package.json",(done)=>{

            sanitizeStub.returns({});
            instalDepsStup.resolves(true);
            pa.initializeProject("test","testDirectory").then(()=>{

                expect(sanitizeStub).to.have.been.calledWith("test","testDirectory").calledOnce;
                done()
            });

        });

        it("should install project dependencies",(done)=>{

            sanitizeStub.returns({});
            instalDepsStup.resolves(true);
            pa.initializeProject("test","testDirectory").then(()=>{

                expect(instalDepsStup).to.have.been.calledWith("testDirectory").calledOnce;
                done();
            });
        });


        it("should reject with error if any issue with installing dependencies",(done)=>{

            sanitizeStub.returns({});
            instalDepsStup.rejects(new Error("yay"));
            pa.initializeProject("test","testDirectory").then(null,(error)=>{

                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("yay");
                done()
            });
        });


    });
});