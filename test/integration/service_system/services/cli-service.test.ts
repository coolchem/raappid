/// <reference path="../../../../src/typings/tsd.d.ts" />

import chai = require('chai');
import sinon = require('sinon');
import chalk = require('chalk');
import cliService =require("../../../../src/lib/service_system/services/cli-service");
import SinonSpy = Sinon.SinonSpy;

chalk.enabled = true;

chai.use(require("sinon-chai"));

var stdin = require('mock-stdin').stdin();

describe('cli-service Integration Tests', () => {

    var expect = chai.expect;
    var logSpy;

    beforeEach(()=>{
        logSpy = sinon.spy(console,"log");
    });
    afterEach(()=>{
       logSpy.restore();
    });

    describe('log', () => {

        afterEach(()=>{
            logSpy.restore();
            logSpy = sinon.spy(console,"log");
        });

        it('should call the console.log with the message', function(done) {

            cliService.log("message");
            expect(logSpy).to.have.been.calledWith("message");
            done();

        });

        it('should not throw error if color is null or undefined or empty string', function(done) {

            cliService.log("message","");
            cliService.log("message");
            cliService.log("message",null);

            expect(logSpy).to.have.been.calledWith("message").calledThrice;

            done();

        });

        it('should throw error is unsupported color is given', function(done) {

            var throws = function(){
                cliService.log("message","asdaad");
            };


            expect(throws).to.throw(cliService.ERROR_UNSUPPORTED_COLOR);
            done();

        });

        it('should not throw error if supported color is given', function(done) {
            var color:string = "red";
            var throws = function(){
                cliService.log("message",color);
            };

            expect(throws).to.not.throw(cliService.ERROR_UNSUPPORTED_COLOR);

            color = "blue";
            expect(throws).to.not.throw(cliService.ERROR_UNSUPPORTED_COLOR);

            color = "green";
            expect(throws).to.not.throw(cliService.ERROR_UNSUPPORTED_COLOR);

            color = "Green";
            expect(throws).to.not.throw(cliService.ERROR_UNSUPPORTED_COLOR);

            color = "yellow";
            expect(throws).to.not.throw(cliService.ERROR_UNSUPPORTED_COLOR);
            done();

        });

        it('should apply the color if sent to log the message with', function(done) {

            cliService.log("message","red");

            expect(logSpy).to.have.been.calledWith(chalk.red("message"));
            done()

        });

    });

    describe('warn', () => {

        it('should log message with color yellow', function(done) {

            cliService.warn("message");
            expect(logSpy).to.have.been.calledWith(chalk.yellow("message"));
            done();

        });

    });

    describe('logError', () => {

        it('should log message in red', function(done) {

            cliService.logError("message");
            expect(logSpy).to.have.been.calledWith(chalk.red("message"));
            done();
        });

    });

    describe('logSuccess', () => {

        it('should log message in green', function(done) {

            cliService.logSuccess("message");
            expect(logSpy).to.have.been.calledWith(chalk.green("message"));
            done();
        });

    });


    describe('askInput', () => {

        var stdOutSpy:SinonSpy;
        beforeEach(function () {
            stdin = require('mock-stdin').stdin();
            stdOutSpy = sinon.spy(process.stdout,"write");

        });

        afterEach(()=>{
            stdin.end();
            stdin.reset();
            stdOutSpy.restore();
        });

        it('should ask user for input', function(done) {

            process.nextTick(function mockResponse() {
                stdin.send('i am fine\n');
            });

            cliService.askInput("Hello how are u?").then((input)=>{

                expect(stdOutSpy).to.have.been.calledWith("Hello how are u?:");
                expect(input).to.equal("i am fine");
                done();
            })

        });

        it('should accept input when user hits return or enter', function(done) {

            process.nextTick(function mockResponse() {
                stdin.send('i am fine\r');
            });

            cliService.askInput("Hello how are u?").then((input)=>{

                expect(input).to.equal("i am fine");

                process.nextTick(function mockResponse() {
                    stdin.send('i am fine\u0004');
                });

                cliService.askInput("Hello how are u?").then((input)=>{

                    expect(input).to.equal("i am fine");
                    done();
                });
            })

        });

        it("should add color to the message if it is provided",(done)=>{
            process.nextTick(function mockResponse() {
                stdin.send('i am fine\n');
            });

            cliService.askInput("Hello how are u?","yellow").then((input)=>{

                expect(stdOutSpy).to.have.been.calledWith(chalk.yellow("Hello how are u?:"));
                expect(input).to.equal("i am fine");
                done();
            })
        });

    });

    describe('confirm', () => {

        var stdOutSpy:SinonSpy;
        beforeEach(function () {
            stdOutSpy = sinon.spy(process.stdout,"write");
            stdin = require('mock-stdin').stdin();
        });

        afterEach(()=>{
            stdin.end();
            stdin.reset();
            stdOutSpy.restore();
        });

        it('should ask user to give yes or no answer', function(done) {

            cliService.confirm("Are we there yet?").then(()=>{

            });
            expect(stdOutSpy).to.have.been.calledWith("Are we there yet?[y/n]:");
            done();
        });


        it('should return true if the answer is yes or y', function(done) {
            process.nextTick(function mockResponse() {
                stdin.send('yes\n');
            });

            cliService.confirm("Are we there yet?").then((answer)=>{

                expect(answer).to.equal(true);

                process.nextTick(function mockResponse() {
                    stdin.send('y\n');
                });

                cliService.confirm("Are we there yet?").then((answer)=>{

                    expect(answer).to.equal(true);

                    done();

                })

            })
        });

        it('should return false if the answer is no or n', function(done) {
            process.nextTick(function mockResponse() {
                stdin.send('no\n');
            });

            cliService.confirm("Are we there yet?").then((answer)=>{

                expect(answer).to.equal(false);

                process.nextTick(function mockResponse() {
                    stdin.send('n\n');
                });

                cliService.confirm("Are we there yet?").then((answer)=>{

                    expect(answer).to.equal(false);

                    done();

                })

            })
        });

        it('should re-ask the question if the answer is not yes/no or y/n', function(done) {

            process.nextTick(function mockResponse() {
                stdin.send('i do not know\n');
            });

            cliService.confirm("Are we there yet yet?").then((answer)=>{

                expect(stdOutSpy).to.have.been.calledWith("Are we there yet yet?[y/n]:").calledTwice;
                done();
            });

            setTimeout(()=>{
                stdin.send('y\n');
            },500)
        });

    });






});




