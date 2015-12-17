/// <reference path="../../../../src/typings/tsd.d.ts" />

import chai = require('chai');
import sinon = require('sinon');
import ps =require("../../../../src/lib/service_system/services/project-service");
import repoService = require("../../../../src/lib/service_system/services/repo-service");
import path = require("path");
import fs = require("fs-extra");
import shell = require("../../../../src/lib/service_system/utils/shell-util");
import cliService = require("../../../../src/lib/service_system/services/cli-service")

import pm = require("../../../../src/lib/service_system/managers/project-manager");


import SinonStub = Sinon.SinonStub;
import SinonSpy = Sinon.SinonSpy;

chai.use(require("sinon-chai"));
require('sinon-as-promised');


describe('project-manager Integration Tests', () => {

    var expect = chai.expect;



});




