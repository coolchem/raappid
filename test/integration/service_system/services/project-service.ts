/// <reference path="../../../../src/typings/tsd.d.ts" />

import chai = require('chai');
import sinon = require('sinon');
import ps =require("../../../../src/lib/service_system/services/project-service");
import path = require("path");
import fs = require("fs-extra");
import shell = require("../../../../src/lib/service_system/utils/shell-util")
import SinonStub = Sinon.SinonStub;
import SinonSpy = Sinon.SinonSpy;

chai.use(require("sinon-chai"));
require('sinon-as-promised');


describe('project-service Integration Tests', () => {

    var expect = chai.expect;

    describe('downloadTemplate', () => {

        var tempProjectDir:string = path.resolve("./test/tempProject");

        beforeEach((done)=>{
            fs.mkdirs(tempProjectDir, function (err) {
                fs.writeFileSync(tempProjectDir+"/package.json",JSON.stringify({version:"0.0.1",  devDependencies: {}}, null, '  ') + '\n');

                done();
            })

        });

        afterEach(()=>{
            fs.removeSync(tempProjectDir);
        });

        it('should download the template to node_modules, if templateName is given', function(done) {

            this.timeout(10000);
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

    });

    describe('installDependencies', () => {


        var tempProjectDir:string = path.resolve("./test/tempProject");
        beforeEach((done)=>{
            fs.mkdirs(tempProjectDir, function (err) {
                fs.writeFileSync(tempProjectDir+"/package.json",JSON.stringify({version:"0.0.1",devDependencies:{typescript:"^1.7"}}, null, '  ') + '\n');
                fs.mkdirsSync(tempProjectDir+"/scripts");
                done();
            })

        });

        afterEach(()=>{
            fs.removeSync(tempProjectDir);

        });



        it('should do npm install', function(done) {

            this.timeout(10000);

            fs.writeFileSync(tempProjectDir +"/scripts/install.js",
                `
                 console.log('yay')
                `);

            ps.installDependencies(tempProjectDir).then((result)=>{
                try {
                    var stats = fs.lstatSync(tempProjectDir+"/node_modules");

                    if (stats.isDirectory()) {
                        done();
                    }
                }
                catch (e) {

                    done("Directory Should Have existed\n"+ e);
                }

            });
        });


    });



});




