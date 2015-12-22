/// <reference path="../../../../src/typings/tsd.d.ts" />

import chai = require('chai');
import sinon = require('sinon');
import repoService = require("../../../../src/lib/service_system/services/repo-service");
import path = require("path");
import fs = require("fs-extra");
import shell = require("../../../../src/lib/service_system/utils/shell-util");
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


describe('repo-service Integration Tests', () => {

    var expect = chai.expect;

    describe('validateGit', () => {

        it('should return true', function() {

            expect(repoService.validateGit()).to.be.true;
        });

    });

    describe('initializeGit', () => {

        var tempProjectDir:string = path.resolve("./test/tempProject");

        it('should run git init in the project directory given', function(done) {


            fs.mkdirsSync(tempProjectDir);
            repoService.initializeGit(tempProjectDir).then((result)=>{

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

    });


    describe('cloneGitRepository', () => {

        it('should do git clone into provided project directory', function(done) {

            this.timeout(30000);
            var tempDir:string = path.resolve("./test/tempProject");
            fs.mkdirsSync(tempDir);

            repoService.cloneGitRepository("raappid","test-cloning",tempDir).then(()=>{
                try {
                    // Query the entry
                    var stats = fs.lstatSync(tempDir+"/test-cloning");

                    // Is it a directory?
                    if (stats.isDirectory()) {
                        done();
                    }
                    else
                    {
                        done(new Error("Directory should have been created"))
                    }
                }
                catch (e) {

                    done(new Error("Directory should have been created"));
                }
                fs.removeSync(tempDir);
            })

        });

    });


    describe('createRemoteRepository', () => {


        it('should create the remote repository', function(done) {

            this.timeout(30000);
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

    describe('getUsersPrimaryEmail', () => {


        it('should get the user email', function(done) {

            this.timeout(30000);
            loadEnv();
            if(process.env.TEST_GITHUB)
            {
                var user:string[] = process.env.TEST_GITHUB.split(':');

                repoService.getUsersPrimaryEmail(user[0],user[1]).then((result)=>{

                    expect(result).to.not.equal("");
                    done();

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




