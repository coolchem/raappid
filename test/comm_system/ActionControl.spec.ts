/// <reference path="../../src/typings/tsd.d.ts" />


import {ActionControl} from "../../src/lib/comm_system/ActionControl";
import {EventStream} from "../../src/lib/comm_system/EventStream";
import {IEventStream} from "../../src/lib/interfaces/comm_system/IEventStream";

import chai = require('chai');

class MockActionControl extends ActionControl
{
    getEventStream():IEventStream
    {
        return this.eventStream;
    }

    getHandlers():any{
        return this.actionHandlers;
    }
}

describe('ActionControl', function() {

    var expect = chai.expect;
    var actionControl;
    var throws;

    beforeEach(function (done) {
        actionControl = new MockActionControl();
        throws = null;
        done();
    });


    it('should create its own instance of event stream if no intance in passed in constructor', function(done) {
        actionControl = new MockActionControl();
        expect(actionControl.getEventStream()).to.not.be.undefined;
        expect(actionControl.getEventStream()).to.not.be.null;

        actionControl = new MockActionControl(null);
        expect(actionControl.getEventStream()).to.not.be.undefined;
        expect(actionControl.getEventStream()).to.not.be.null;

        done();
    });

    it('should use instance of event stream passed in the constructor', function(done) {

        var customEventStream = new EventStream();

        actionControl = new MockActionControl(customEventStream);
        expect(actionControl.getEventStream()).to.equal(customEventStream);
        done();
    });

    describe("registerAction",()=>{
        it('should throw an error when registering action with actionName not of type string', function(done) {
            throws = function() {
                actionControl.registerAction({});
            };
            expect(throws).to.throw(ActionControl.ERROR_REGISTERING_ACTION_NAME_NOT_TYPE_STRING);

            throws = function() {
                actionControl.registerAction();
            };
            expect(throws).to.throw(ActionControl.ERROR_REGISTERING_ACTION_NAME_NOT_TYPE_STRING);

            throws = function() {
                actionControl.registerAction(null);
            };
            expect(throws).to.throw(ActionControl.ERROR_REGISTERING_ACTION_NAME_NOT_TYPE_STRING);

            done();
        });

        it('should throw an error when no handler is passed, while registering an action', function(done) {

            throws = function() {
                actionControl.registerAction("action");
            };

            expect(throws).to.throw(ActionControl.ERROR_REGISTERING_ACTION_NO_HANDLER_GIVEN);

            throws = function() {
                actionControl.registerAction("event",null);
            };

            expect(throws).to.throw(ActionControl.ERROR_REGISTERING_ACTION_NO_HANDLER_GIVEN);

            done();
        });

        it('should throw an error when handler is not of type function, while registering an action', function(done) {

            throws = function() {
                actionControl.registerAction("event",{});
            };

            expect(throws).to.throw(ActionControl.ERROR_REGISTERING_ACTION_HANDLER_NOT_TYPE_FUNCTION);
            done();
        });

        it('should throw an error when handler is already set for the action', function(done) {

            actionControl.registerAction("event",function(){});
            throws = function() {
                actionControl.registerAction("event",function(){});
            };

            expect(throws).to.throw(ActionControl.ERROR_REGISTERING_ACTION_ONLY_ONE_HANDLER_ALLOWED);
            done();
        });
    });

    describe("unregisterAction",()=>{
        it('should throw an error when trying to un-register from an action not of type string', function(done) {
            throws = function() {
                actionControl.unregisterAction({});
            };
            expect(throws).to.throw(ActionControl.ERROR_UNREGISTERING_ACTION_NAME_NOT_TYPE_STRING);

            throws = function() {
                actionControl.unregisterAction();
            };
            expect(throws).to.throw(ActionControl.ERROR_UNREGISTERING_ACTION_NAME_NOT_TYPE_STRING);

            throws = function() {
                actionControl.unregisterAction(null);
            };
            expect(throws).to.throw(ActionControl.ERROR_UNREGISTERING_ACTION_NAME_NOT_TYPE_STRING);

            done();
        });

        it('should throw an error when no handler is passed while un-registering to an anction', function(done) {

            throws = function() {
                actionControl.unregisterAction("event");
            };

            expect(throws).to.throw(ActionControl.ERROR_UNREGISTERING_ACTION_NO_HANDLER_GIVEN);

            throws = function() {
                actionControl.unregisterAction("event",null);
            };

            expect(throws).to.throw(ActionControl.ERROR_UNREGISTERING_ACTION_NO_HANDLER_GIVEN);

            done();
        });

        it('should throw an error when trying to un-register with handler not of type function', function(done) {

            throws = function() {
                actionControl.unregisterAction("event",{});
            };
            expect(throws).to.throw(ActionControl.ERROR_UNREGISTERING_ACTION_HANDLER_NOT_TYPE_FUNCTION);
            done();
        });

        it('should successfully unregister action', function(done) {

            function handler():void
            {

            }
            actionControl.registerAction("action",handler);
            actionControl.unregisterAction("action",handler);
            expect(actionControl.getHandlers()["action"]).to.be.null;
            done();
        });
    });

    describe("perform",()=>{
        it('should throw an error when taking action name not of type string', function(done) {

            throws = function() {
                actionControl.perform({});
            };
            expect(throws).to.throw(ActionControl.ERROR_TAKING_ACTION_ACTION_NAME_NOT_TYPE_STRING);
            done();
        });

        it('should throw an error when no handler found for the action', function(done) {

            throws = function() {
                actionControl.perform("action");
            };
            expect(throws).to.throw(ActionControl.ERROR_TAKING_ACTION_NO_HANDLER_REGISTERED);
            done();
        });

        it('should successfully call any handler associated with the action', function(done) {

            var handler = function(data){
                done();
            };

            actionControl.registerAction("action",handler);

            actionControl.perform("action");
        });

        it('should successfully call handler associated with the action, with appropriate parameters', function(done) {

            var paramA = "A";
            var paramB = {};
            var handler = function(param1,param2){

                expect(arguments.length).to.equal(2);
                expect(param1).to.equal(paramA);
                expect(param2).to.equal(paramB);
                done();
            };

            actionControl.registerAction("action",handler);

            actionControl.perform("action",paramA,paramB);

        });

        it('should call the handler with right context if the context is passed while registering', function(done) {

            var handlerContext ={};
            var paramA = "A";
            var paramB = {};
            var handler = function(param1,param2){

                expect(this).to.equal(handlerContext);
                done();
            };

            actionControl.registerAction("action",handler,handlerContext);

            actionControl.perform("action",paramA,paramB);

        });

        it('should call the handler with global context if no context is passed while registering', function(done) {

            var handler = function(){

                expect(this).to.equal(global);
                done();
            };

            actionControl.subscribe("action",handler);
            actionControl.publish("action");

        });

        it('should return a promise, when handler returns a promise', function(done) {

            var handler = function(data){
                return new Promise(function(){});
            };
            actionControl.registerAction("action",handler);

            var result = actionControl.perform("action", "humm");

            expect(result).to.be.instanceof(Promise);
            done();
        });

        it('should return a promise, when handler returns a value', function(done) {

            var handler = function(data){
                return true;
            };
            actionControl.registerAction("action",handler);

            var result = actionControl.perform("action", "humm");

            expect(result).to.be.instanceof(Promise);
            done();
        });
    });



    //testing the event stream functionality

    describe("subscribe",()=>{


        it('should throw an error when subscribing with event not of type string', function(done) {
            throws = function() {
                actionControl.subscribe({});
            };
            expect(throws).to.throw(ActionControl.ERROR_SUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

            throws = function() {
                actionControl.subscribe();
            };
            expect(throws).to.throw(ActionControl.ERROR_SUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

            throws = function() {
                actionControl.subscribe(null);
            };
            expect(throws).to.throw(ActionControl.ERROR_SUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

            done();
        });

        it('should throw an error when no handler is passed while subscribing to an event', function(done) {

            throws = function() {
                actionControl.subscribe("event");
            };

            expect(throws).to.throw(ActionControl.ERROR_NO_HANDLER_WHILE_SUBSCRIBING);

            throws = function() {
                actionControl.subscribe("event",null);
            };

            expect(throws).to.throw(ActionControl.ERROR_NO_HANDLER_WHILE_SUBSCRIBING);

            done();
        });

        it('should throw an error when handler is not of type function', function(done) {

            throws = function() {
                actionControl.subscribe("event",{});
            };

            expect(throws).to.throw(ActionControl.ERROR_SUBSCRIBING_HANDLER_NOT_TYPE_FUNCTION);
            done();
        });

        it('should allow to subscribe to event of type string', function(done) {

            actionControl.subscribe("event", function(data){});
            expect(actionControl.hasSubscribers("event")).to.be.true;
            done();
        });
    });

    describe("publish",()=>{


        it('should throw an error when trying to publish event not of type string', function(done) {

            throws = function() {
                actionControl.publish({});
            };
            expect(throws).to.throw(ActionControl.ERROR_PUBLISHING_EVENT_NAME_NOT_TYPE_STRING);

            throws = function() {
                actionControl.publish();
            };
            expect(throws).to.throw(ActionControl.ERROR_PUBLISHING_EVENT_NAME_NOT_TYPE_STRING);

            throws = function() {
                actionControl.publish(null);
            };
            expect(throws).to.throw(ActionControl.ERROR_PUBLISHING_EVENT_NAME_NOT_TYPE_STRING);

            done();
        });

        it('should successfully publish event of type string to all the handlers', function(done) {

            var handler1Called = false;
            var handler2Called = false;

            var noOfhandlersCalled = 0;

            var handler1 = function(data){
                noOfhandlersCalled++;
                handler1Called = true;
                if(handler1Called && handler2Called)
                    completeTest();

            };

            var handler2 = function(data){
                noOfhandlersCalled++;
                handler2Called = true;
                if(handler1Called && handler2Called)
                    completeTest();
            };

            actionControl.subscribe("event", handler1);
            actionControl.subscribe("event", handler2);

            actionControl.publish("event");

            function completeTest(){

                expect(noOfhandlersCalled).to.equal(2);
                done();
            }

        });

        it('should successfully call all the handlers with published data', function(done) {

            var eventData = {};
            actionControl.subscribe("event", function(data){

                expect(data).to.equal(eventData);
                done();

            });

            actionControl.publish("event",eventData);

        });

        it('should call the handler with right context if the context is passed while registering', function(done) {

            var handlerContext ={};
            var handler = function(){

                expect(this).to.equal(handlerContext);
                done();
            };

            actionControl.subscribe("action",handler,handlerContext);
            actionControl.publish("action");

        });

        it('should call the handler with global context if no context is passed while subscribing', function(done) {


            var handler = function(){

                expect(this).to.equal(global);
                done();
            };

            actionControl.subscribe("action",handler);
            actionControl.publish("action");

        });
    });

    describe("unSubscribe",()=>{
        it('should throw an error when trying to unsubscribe from an event not of type string', function(done) {
            throws = function() {
                actionControl.unSubscribe({});
            };
            expect(throws).to.throw(ActionControl.ERROR_UNSUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

            throws = function() {
                actionControl.unSubscribe();
            };
            expect(throws).to.throw(ActionControl.ERROR_UNSUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

            throws = function() {
                actionControl.unSubscribe(null);
            };
            expect(throws).to.throw(ActionControl.ERROR_UNSUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

            done();
        });

        it('should throw an error when no handler is passed while unsubscribing to an event', function(done) {

            throws = function() {
                actionControl.unSubscribe("event");
            };

            expect(throws).to.throw(ActionControl.ERROR_NO_HANDLER_WHILE_UNSUBSCRIBING);

            throws = function() {
                actionControl.unSubscribe("event",null);
            };

            expect(throws).to.throw(ActionControl.ERROR_NO_HANDLER_WHILE_UNSUBSCRIBING);

            done();
        });

        it('should throw an error when trying to unsubscribe with handler not of type function', function(done) {

            throws = function() {
                actionControl.unSubscribe("event",{});
            };
            expect(throws).to.throw(ActionControl.ERROR_UNSUBSCRIBING_HANDLER_NOT_TYPE_FUNCTION);
            done();
        });

        it('should allow to unsubscribe an handler for an event if it is registered', function(done) {

            var handler1 = function(data){};

            var handler2 = function(data){};

            actionControl.subscribe("event", handler1);
            actionControl.subscribe("event", handler2);

            expect(actionControl.hasSubscribers("event")).to.be.true;

            actionControl.unSubscribe("event",handler1);

            var handlers = actionControl.eventStream.handlers["event"];
            expect(handlers.length).to.equal(1);

            done();
        });
    });

});
