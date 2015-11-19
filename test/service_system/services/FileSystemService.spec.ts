

/// <reference path="../../../src/typings/tsd.d.ts" />

import chai = require('chai');
import {FileSystemService} from "../../../src/lib/service_system/services/FileSystemService";

var fs = require("fs-extra");
var path = require('path');

var testDir:string = path.resolve("./test");
var tempDirectoryPath = testDir + "/tempDir";

describe('FileSystemService Test cases', () => {

    var fsService:FileSystemService = new FileSystemService();
    var expect = chai.expect;
    var assert = chai.assert;

    before((done)=>{

        fs.mkdirs(tempDirectoryPath, function (err) {

            done();
        })


    });

    after(()=>{

        fs.removeSync(tempDirectoryPath);

    });

    describe('createDirectory', () => {

        it('should successfully create the dir', function(done) {

            var promise:Promise<boolean> = fsService.createDirectories(["test","src"],tempDirectoryPath);

            if(!(promise instanceof Promise))
            {
                done("should return a promise")
            }
            promise.then((result:boolean)=>{

                var srcExists:boolean = false;
                var testExists:boolean = false;
                try {
                    // Query the entry
                    var stats = fs.lstatSync(tempDirectoryPath+"/test");

                    // Is it a directory?
                    if (stats.isDirectory()) {
                        testExists = true;
                    }
                }
                catch (e) {

                    done("'test' directory should have been created\n"+e);
                }

                try {
                    // Query the entry
                    var stats = fs.lstatSync(tempDirectoryPath+"/src");

                    // Is it a directory?
                    if (stats.isDirectory()) {
                        srcExists = true;
                    }
                }
                catch (e) {
                    done("'src' directory should have been created\n"+e);
                }

                expect(srcExists).to.equal(true);
                expect(testExists).to.equal(true);

                done();
            }, (error)=>{
                done("should not have failed:\n" + error);

            });

        });

    });

    describe('copyDirectory', () => {

        it('should throw error if path to the directory to be copied is invalid', function(done) {

            fsService.copyDirectory(tempDirectoryPath+"/what",tempDirectoryPath+"/temp").then(()=>{
               done("Copy directory should not have been successful");
            }).catch((error)=>{

                done();
            });

        });

        it('should successfully copy the dir', function(done) {

            fs.mkdirsSync(tempDirectoryPath+"/testCopyDir");
            fs.writeFileSync(tempDirectoryPath+"/testCopyDir/test.txt");

            var promise:Promise<boolean> = fsService.copyDirectory(tempDirectoryPath+"/testCopyDir",tempDirectoryPath+"/temp");

            if(!(promise instanceof Promise))
            {
                done("should return a promise")
            }

            promise.then(()=>{

                try {
                    var stats = fs.lstatSync(tempDirectoryPath+"/temp/test.txt");

                    // Is it a directory?
                    if (stats.isFile()) {
                        done();
                    }
                }
                catch (e) {

                    done("File Should Have existed\n"+ e);
                }

            },(error)=>{
                done("should not have failed\n" + error);
            })

        });

    });


    describe('deleteFiles', () => {

        it('should successfully delete the file', function(done) {

            fs.writeFileSync(tempDirectoryPath+"/testFile1.js");
            fs.writeFileSync(tempDirectoryPath+"/testFile2.js");

            var promise:Promise<boolean> = fsService.deleteFiles([tempDirectoryPath+"/testFile1.js",tempDirectoryPath+"/testFile2.js"]);

            if(!(promise instanceof Promise))
            {
                done("should return a promise")
            }

            promise.then(()=>{

                try {
                    var stats = fs.lstatSync(tempDirectoryPath+"/testFile1.js");

                    // Is it a directory?
                    if (stats.isFile()) {
                        done("'testFile1.js' Should not  Have existed");
                    }
                }
                catch (e) {

                }

                try {
                    var stats = fs.lstatSync(tempDirectoryPath+"/testFile2.js");

                    // Is it a directory?
                    if (stats.isFile()) {
                        done("'testFile2.js' Should not  Have existed");
                    }
                }
                catch (e) {


                }


                done();

            },(error)=>{
                done("should not have failed\n" + error);
            })
        });

    });



});




