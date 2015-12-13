/// <reference path="../../../src/typings/tsd.d.ts" />

import chai = require('chai');
import sinon = require('sinon');
import ps =require("../../../src/lib/service_system/services/project-service");
import repoService = require("../../../src/lib/service_system/services/repo-service");
import path = require("path");
import fs = require("fs-extra");
import shell = require("../../../src/lib/service_system/utils/shell-util");
import cliService = require("../../../src/lib/service_system/services/cli-service")

import pm = require("../../../src/lib/service_system/managers/project-manager");


import SinonStub = Sinon.SinonStub;
import SinonSpy = Sinon.SinonSpy;

chai.use(require("sinon-chai"));
require('sinon-as-promised');


describe('project-manager Test cases', () => {

    var expect = chai.expect;


    describe('validate', () => {


        it('should reject with error if Git not installed on the system', function(done) {

            var stub:SinonStub = sinon.stub(repoService,"validateGit");
            stub.returns(false);
            pm.validate("node-app","asdad").catch((error)=>{
                stub.restore();
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal(pm.ERROR_GIT_NOT_INSTALLED);
                done();
            });
        });

        it('should reject with error if not valid project type', function(done) {

            pm.validate("asdada","asdad").catch((error)=>{
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal(pm.ERROR_INVALID_PROJECT_TYPE);
                done();
            });
        });

        it('should reject with error if not valid project name', function(done) {

            pm.validate("node-app","as?ad").catch((error)=>{
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal(pm.ERROR_INVALID_PROJECT_NAME);
                done();
            });
        });


        it('should resolve to true if everything checks out', function(done) {

            pm.validate("node-app","asdad").then((result)=>{
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
            pm.createRemoteRepository("humm").then(()=>{});
            expect(confirmStub).to.have.been.calledWith(pm.MESSAGE_CREATE_REMOTE_REPO.replace("#repo-type","GitHub"));
            done();
        });

        it('should resolve with false if user answers no', function(done) {

            confirmStub.resolves(false);
            pm.createRemoteRepository("humm").then((result)=>{
                expect(result).to.be.false;
            });
            done();

        });

        it('should ask user for credentials and create repository', function(done) {

            confirmStub.withArgs("Would like to create a GitHub repository for your project?").resolves(true);
            askStub.withArgs("Enter Username").resolves("test");
            askStub.withArgs("Enter Password").resolves("test");

            var repoStub:any = sinon.stub(repoService,"createRemoteRepository");
            repoStub.resolves({});

            pm.createRemoteRepository("humm").then(()=>{
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

            pm.createRemoteRepository("humm").then(()=>{

                expect(logErrorSpy).to.have.been.calledWith(pm.ERROR_CREATING_REPO_BAD_CREDENTIALS.replace("#repo-type","GitHub"));
                expect(logSpy).to.have.been.calledWith(pm.MESSAGE_RE_ENTER_CREDENTIALS);

                expect(stub1).to.have.been.calledWith("Enter Username").calledTwice;
                expect(stub2).to.have.been.calledWith("Enter Password").calledTwice;
                repoStub.restore();

                done();
            });

        });

/*        it('should confirm with user to create local git if credentials fail second time', function(done) {

            askStub.withArgs("Enter username").resolves("test");
            askStub.withArgs("Enter passoword").resolves("test");

            confirmStub.withArgs(pm.MESSAGE_CONTINUE_WITH_LOCAL_GIT_REPO.replace("#repo-type","github")).resolves(false);
            pm.createRemoteRepository("humm").then((result)=>{
                expect(logErrorSpy).to.have.been.calledWith(pm.ERROR_CREATING_REPO_BAD_CREDENTIALS.replace("#repo-type","github")).calledTwice;
                expect(logSpy).to.have.been.calledWith(pm.MESSAGE_RE_ENTER_CREDENTIALS).calledOnce;
                expect(logSpy).to.have.been.calledWith(pm.MESSAGE_CONTINUE_WITH_LOCAL_GIT_REPO.replace("#repo-type","github")).calledOnce;
                done();
            });


        });*/

/*       it('should confirm with user to create local git if there was any issue besides bad credentials with creating repo', function(done) {

            askStub.withArgs("Enter username").resolves("test");
            askStub.withArgs("Enter passoword").resolves("test");

            var repoStub:any = sinon.stub(repoService,"createRemoteRepository");
            repoStub.rejects(new Error("yay"));

            confirmStub.withArgs(pm.MESSAGE_CONTINUE_WITH_LOCAL_GIT_REPO.replace("#repo-type","github")).resolves(false);

            pm.createRemoteRepository("humm").then((result)=>{

                expect(logErrorSpy).to.not.have.been.calledWith(pm.ERROR_CREATING_REPO_BAD_CREDENTIALS.replace("#repo-type","github"));
                expect(logSpy).to.not.have.been.calledWith(pm.MESSAGE_RE_ENTER_CREDENTIALS);
                expect(logSpy).to.have.been.calledWith(pm.MESSAGE_CONTINUE_WITH_LOCAL_GIT_REPO.replace("#repo-type","github")).calledOnce;
                done();
            });

        });*/


    });

});




