/// <reference path="../../../../src/typings/tsd.d.ts" />

import chai = require('chai');
import sinon = require('sinon');
import shell =require("../../../../src/lib/service_system/utils/shell-util");
import fs = require("fs-extra");
import path = require("path");

chai.use(require("sinon-chai"));


describe('shell-util Integration Tests', () => {

    var expect = chai.expect;

    var tempProjectDir:string = path.resolve("./test/tempProject");
    var spyExec;

    beforeEach((done)=>{

        spyExec = sinon.spy(require('child_process'),"spawn");

        fs.mkdirs(tempProjectDir, function (err) {
            fs.writeFileSync(tempProjectDir+"/package.json",JSON.stringify({version:"0.0.1",  devDependencies: {"del": "^2.0.2"}}, null, '  ') + '\n');
            fs.mkdirsSync(tempProjectDir+"/scripts");
            fs.writeFileSync(tempProjectDir +"/scripts/install1.js",
                `
                 var fs = require("fs");
                 fs.writeFileSync("temp1.text");
                `);
            fs.writeFileSync(tempProjectDir +"/scripts/install2.js",
                `
                 var fs = require("fs");
                 fs.writeFileSync("temp2.text");
                `);
            done();
        })

    });

    afterEach(()=>{
        fs.removeSync(tempProjectDir);
        spyExec.restore();
    });

    describe('exec', () => {

        afterEach(()=>{
            spyExec.restore();
            spyExec = sinon.spy(require('child_process'),"spawn");
        });


        it('should reject with error if the command throws error', function(done) {

            shell.exec("node adasdad").then(()=>{
              done("should not have been called\n")
            }).catch((error)=>{
                expect(spyExec).to.have.been.calledOnce;
                expect(error).to.be.instanceOf(Error);
                done();
            });


        });

        it('should resolve to true if the command is successful', function(done) {

            shell.exec("npm -v").then((result)=>{

                expect(result).to.be.true;
                expect(spyExec).to.have.been.calledOnce;
                done();

            }).catch((error)=>{

                done("should not have been called\n");
            });


        });

        it('should execute command process.cwd if no working diretory provided', function(done) {

            shell.exec("node " + tempProjectDir+"/scripts/install1.js").then(()=>{

                try {
                    var stats = fs.lstatSync(process.cwd()+"/temp1.text");

                    if (stats.isFile()) {
                        done();
                    }
                    else
                    {
                        done("File Should Have existed\n")
                    }

                    fs.removeSync(process.cwd()+"/temp1.text")
                }
                catch (e) {

                    done("File Should Have existed\n"+ e);
                }

            }).catch((error)=>{

                done("should not have been called\n");
            });

        });

        it('should execute command process.cwd if no working is given as empty string', function(done) {

            shell.exec("node " + tempProjectDir+"/scripts/install1.js","").then(()=>{

                try {
                    var stats = fs.lstatSync(process.cwd()+"/temp1.text");

                    if (stats.isFile()) {
                        done();
                    }
                    else
                    {
                        done("File Should Have existed\n")
                    }

                    fs.removeSync(process.cwd()+"/temp1.text")
                }
                catch (e) {

                    done("File Should Have existed\n"+ e);
                }

            }).catch((error)=>{

                done("should not have been called\n");
            });

        });

        it('should execute command in the working directory given', function(done) {

            shell.exec("node " + tempProjectDir+"/scripts/install1.js",tempProjectDir).then(()=>{

                try {
                    var stats = fs.lstatSync(tempProjectDir+"/temp1.text");

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

            }).catch((error)=>{

                done("should not have been called\n");
            });
        });



    });

    describe('series', () => {

        it('should reject with error if any of the commands fail', function(done) {


            shell.series(["node adasdad,node adasdad"]).then(()=>{

                done("should not have been called\n")
            }).catch((error)=>{

                expect(error).to.be.instanceOf(Error);
                expect(spyExec).to.have.been.calledOnce;
                done();
            });


        });

        it('should call all the commands before resolving to true', function(done) {

            shell.series(["node " + tempProjectDir+"/scripts/install1.js","node " + tempProjectDir+"/scripts/install2.js"],tempProjectDir).then((result)=>{

                expect(result).to.be.true;
                expect(spyExec).to.have.been.calledTwice;

                try {
                    let stats = fs.lstatSync(tempProjectDir+"/temp1.text");

                    if (stats.isFile()) {

                        try {
                            let stats = fs.lstatSync(tempProjectDir+"/temp2.text");

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
                    }
                    else
                    {
                        done("File Should Have existed\n")
                    }
                }
                catch (e) {

                    done("File Should Have existed\n"+ e);
                }
            }).catch((error)=>{

                done("should not have been called\n");
            });

        });

    });
});




