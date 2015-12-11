/// <reference path="../../../src/typings/tsd.d.ts" />

import chai = require('chai');
import sinon = require('sinon');
import repoService = require("../../../src/lib/service_system/services/repo-service");
import path = require("path");
import fs = require("fs-extra");
import shell = require("../../../src/lib/service_system/utils/shell-util");
import SinonStub = Sinon.SinonStub;
import SinonSpy = Sinon.SinonSpy;
import ErrnoException = NodeJS.ErrnoException;


var which = require("which");

chai.use(require("sinon-chai"));
require('sinon-as-promised');

function loadEnv():void
{
    var doc;

    try {
        doc = fs.readFileSync(process.cwd() + "/.env").toString().split('\n');
    } catch (exc) {
        return;
    }

    var i = -1;
    var len = doc.length;
    var row;

    while (++i < len) {
        if (!doc[i]) continue;
        row = doc[i].split(/\s*=\s*/);
        process.env[row.shift()] = row.join('=').replace(/['"]/g, '');
    }
}


describe('repo-service Test cases', () => {

    var expect = chai.expect;

    describe('validateGit', () => {

        var whichStub:SinonStub;
        beforeEach(()=>{
            whichStub = sinon.stub(which,"sync");
        });

        afterEach(()=>{
            whichStub.restore();
        });


        it('should return false if git not installed', function() {

            whichStub.returns(new Error("no git"));
            expect(repoService.validateGit()).to.be.false;
        });


        it('should return true is git installed', function() {

            whichStub.returns(true);
            expect(repoService.validateGit()).to.be.false;
        });

    });

    describe('initializeGit', () => {

        var tempProjectDir:string = path.resolve("./test/tempProject");

        var shellSpy:SinonSpy;
        beforeEach(()=>{
            shellSpy = sinon.spy(shell,"exec");

        });

        afterEach(()=>{
            shellSpy.restore();
        });

        it('should run git init in the project directory given', function(done) {


            fs.mkdirsSync(tempProjectDir);
            repoService.initializeGit(tempProjectDir).then((result)=>{

                expect(shellSpy).calledWith("git init",tempProjectDir);
                fs.readdir(process.cwd()+"/.git",(error)=>{

                    if(error)
                    {
                        done(new Error("Git not initialized"));
                    }
                    else
                    {
                        done();
                    }
                    fs.removeSync(tempProjectDir);
                });
            },(error)=>{
                done(error);
                fs.removeSync(tempProjectDir);
            });


        });

        it('should reject with error if there was issue with git init', function(done) {

            shellSpy.restore();
            var shellStub:any = sinon.stub(shell,"exec");
            shellStub.rejects(new Error("yay"));

            repoService.initializeGit(tempProjectDir).then(null,(error)=>{
                expect(shellStub).calledWith("git init",tempProjectDir);
                expect(error).to.be.instanceOf(Error);
                shellStub.restore();
                done();
            });
        });

    });

    describe('addAllFilesAndCommit', () => {

        var shellStub;
        beforeEach(()=>{
            shellStub = sinon.stub(shell,"series");

        });

        afterEach(()=>{
            shellStub.restore();
        });


        it('should run git add -a and git commit -m in series', function(done) {

            shellStub.resolves(true);
            repoService.addAllFilesAndCommit("testCommit","directoryPath").then(()=>{

                expect(shellStub).to.have.been.calledWith(["git add -A",'git commit -m ' + '"'+"testCommit" +'"'],"directoryPath");
                done();
            });

        });

        it('should reject with error if there was any issue', function(done) {

            shellStub.rejects(new Error("yay"));
            repoService.addAllFilesAndCommit("testCommit","directoryPath").then(null,(error)=>{

                expect(shellStub).to.have.been.calledWith(["git add -A",'git commit -m ' + '"'+"testCommit" +'"'],"directoryPath");
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("yay");
                done();
            });


        });
    });

    describe('cloneGitRepository', () => {

        var shellStub;
        beforeEach(()=>{
            shellStub = sinon.stub(shell,"exec");

        });

        afterEach(()=>{
            shellStub.restore();
        });

        it('should create appropriate remote url and call git clone', function(done) {


            shellStub.resolves(true);

            repoService.cloneGitRepository("test","test","testDir").then(()=>{

                expect(shellStub).to.have.been.calledWith("git clone git@github.com:test/test","testDir");

                done();


            })
        });

        it('should reject with error if there was any error in git cloning', function(done) {


            shellStub.rejects(new Error("yay"));

            repoService.cloneGitRepository("test","test","testDir").then(null,(error)=>{

                expect(shellStub).to.have.been.calledWith("git clone git@github.com:test/test","testDir");
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("yay");
                done();

            })
        });

    });


    describe('createRemoteRepository', () => {

        var spy:SinonSpy;
        var stub:any;
        beforeEach(function () {
            spy = sinon.spy(repoService.github, "authenticate");
            stub = sinon.stub(repoService.github.repos, "create");
        });
        afterEach(function () {
            spy.restore();
            if(stub.restore)
                stub.restore();
        });

        it('should authenticate github, with the username and password given', function(done) {


            repoService.createRemoteRepository("test","test","test");

            expect(spy).to.have.been.calledWith({
                type: "basic",
                username: "test",
                password: "test"
            });
            done();

        });

        it('should resolve with result of the create repo with', function(done) {

            stub.yields(null,"yay");
            repoService.createRemoteRepository("test","test","test").then((result)=>{

                expect(stub).to.have.been.calledWith({
                    name: "test"
                });
                expect(result).to.equal("yay");
                done();

            },(error)=>{});

        });

        it('should reject with error if the create repo throws an error', function(done) {

            stub.yields(new Error("yay"));
            repoService.createRemoteRepository("test","test","test").then(()=>{},(error)=>{

                expect(stub).to.have.been.calledWith({
                    name: "test"
                });
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("yay");
                done();

            });

        });

        it('should create the remote repository', function(done) {

            this.timeout(10000);
            stub.restore();
            loadEnv();
            if(process.env.TEST_GITHUB)
            {
                var user:string[] = process.env.TEST_GITHUB.split(':');

                repoService.createRemoteRepository(user[0],user[1],"test").then((result)=>{

                    repoService.github.repos.delete({user:user[0],repo:"test"},()=>{
                        done();
                    })

                },(error)=>{

                    done(error);

                });
            }
            else
            {
                done()
            }


        });

    });


});




