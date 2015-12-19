/// <reference path="../../../../src/typings/tsd.d.ts" />

import chai = require('chai');
import sinon = require('sinon');
import pm =require("../../../../src/lib/service_system/managers/project-manager");
import path = require("path");
import fs = require("fs-extra");
import shell = require("../../../../src/lib/service_system/utils/shell-util");
import pa = require("../../../../src/lib/service_system/assistants/project-assistant");
import SinonStub = Sinon.SinonStub;
import SinonSpy = Sinon.SinonSpy;

chai.use(require("sinon-chai"));
require('sinon-as-promised');

describe('project-manager Integration Tests', () => {

    var expect = chai.expect;

    describe('createProjectCLI', () => {


        it("should remove project directory, while rejecting with error",(done)=>{

            var copyStub:any = sinon.stub(pa,"copyTemplate");
            copyStub.rejects(new Error("yay"));
            pm.createProjectCLI("basic","myProject").then(null,(error)=>{
                copyStub.restore();
                try {
                    var stats = fs.lstatSync(process.cwd()+"/myProject");
                    if (stats.isDirectory()) {
                        done("Directory Should not Have existed\n");
                    }
                }
                catch (e) {

                    done();
                }

            })


        })
    });
});