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

            this.timeout(30000);
            ps.downloadTemplate("template",tempProjectDir,"raappid/template-basic").then((result)=>{


                try {
                    var stats = fs.lstatSync(tempProjectDir+"/node_modules/template-basic");
                    expect(result).to.equal(tempProjectDir+"/node_modules/template-basic");
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

            this.timeout(30000);

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

    describe('shrinkWrapDependencies', () => {


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



        it('should do npm shrinkwrap', function(done) {

            this.timeout(30000);

            ps.shrinkWrapDependencies(tempProjectDir).then((result)=>{
                try {
                    var stats = fs.lstatSync(tempProjectDir+"/npm-shrinkwrap.json");

                    if (stats.isFile()) {
                        done();
                    }
                    else
                    {
                        done("File should have existed");
                    }
                }
                catch (e) {

                    done("File Should Have existed\n"+ e);
                }

            });
        });


    });

    describe("updatePackageJson",()=>{

        var tempProjectDir:string = path.resolve("./test/tempProject");
        beforeEach((done)=>{
            fs.mkdirs(tempProjectDir, function (err) {
                fs.writeFileSync(tempProjectDir+"/package.json",JSON.stringify({
                        version:"1.5.1",
                        author:"test",
                        description:"dasdadada",
                        homepage:"adasdasdad",
                        repository:"asdadadad",
                        bugs:"sasdadsada",
                        licenses:"asdadadsadad",
                        keywords:"dsadadad",
                        dependencies:{chalk:"^1.1.1"},
                        devDependencies: {typescript:"^1.7"},
                        _where:"asdad",
                        _args:"asdad",
                        gitHead:"asdadad"
                    }, null, '  ') + '\n');

                done();
            })

        });

        afterEach(()=>{
            fs.removeSync(tempProjectDir);
        });

        it("should force update package.json with project name",()=>{

            ps.sanitizePackageJson("test",tempProjectDir);

            var json = JSON.parse(fs.readFileSync(tempProjectDir+"/package.json", 'utf8'));

            expect(json.name).to.equal("test");



        });

        it("should only remove any properties which starts with '_' and also gitHead property",()=>{
            ps.sanitizePackageJson("test",tempProjectDir);

            var json = JSON.parse(fs.readFileSync(tempProjectDir+"/package.json", 'utf8'));

            expect(json.hasOwnProperty("_where")).to.be.false;
            expect(json.hasOwnProperty("_args")).to.be.false;
            expect(json.hasOwnProperty("gitHead")).to.be.false;
            expect(json.devDependencies.typescript).to.equal("^1.7");
            expect(json.dependencies.chalk).to.equal("^1.1.1");

        });

        it("should reset certain properties",()=>{
            ps.sanitizePackageJson("test",tempProjectDir);

            var json = JSON.parse(fs.readFileSync(tempProjectDir+"/package.json", 'utf8'));

            expect(json.author.name).to.equal("");
            expect(json.description).to.equal("");
            expect(json.bugs.url).to.equal("");
            expect(json.repository.url).to.equal("");
            expect(json.repository.type).to.equal("");
            expect(json.licenses.length).to.equal(0);
            expect(json.keywords.length).to.equal(0);

        });

        it("should set the version number to '0.0.1",()=>{
            ps.sanitizePackageJson("test",tempProjectDir);

            var json = JSON.parse(fs.readFileSync(tempProjectDir+"/package.json", 'utf8'));

            expect(json.version).to.equal("0.0.1");
        });
    });



});




