/// <reference path="../../src/typings/tsd.d.ts" />


import chai = require('chai');
import {EventStream} from "../../src/lib/comm_system/EventStream";


describe('EventStream', function() {

    var expect = chai.expect;
    var eventStream;
    var throws;

    beforeEach(function (done) {
        eventStream = new EventStream();
        throws = null;
        done();
    });


    describe("subscribe",()=>{

        it('it should throw an error when subscribing with event not of type string', function(done) {
            throws = function() {
                eventStream.subscribe({});
            };
            expect(throws).to.throw(EventStream.ERROR_SUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

            throws = function() {
                eventStream.subscribe();
            };
            expect(throws).to.throw(EventStream.ERROR_SUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

            throws = function() {
                eventStream.subscribe(null);
            };
            expect(throws).to.throw(EventStream.ERROR_SUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

            done();
        });


        it('it should throw an error when no handler is passed while subscribing to an event', function(done) {

            throws = function() {
                eventStream.subscribe("event");
            };

            expect(throws).to.throw(EventStream.ERROR_NO_HANDLER_WHILE_SUBSCRIBING);

            throws = function() {
                eventStream.subscribe("event",null);
            };

            expect(throws).to.throw(EventStream.ERROR_NO_HANDLER_WHILE_SUBSCRIBING);

            done();
        });

        it('it should throw an error when handler is not of type function', function(done) {

            throws = function() {
                eventStream.subscribe("event",{});
            };

            expect(throws).to.throw(EventStream.ERROR_SUBSCRIBING_HANDLER_NOT_TYPE_FUNCTION);
            done();
        });

        it('it should create handlers array if event is being registered for the first time', function(done) {

            var handlers = eventStream.handlers["event"];
            expect(handlers).to.be.undefined;

            handlers = eventStream.getHandlers("event");
            expect(handlers).not.to.be.undefined;
            done();
        });

        it('it allow to toggle subscription of callback to event', function(done) {

            var handler = function(data){};
            var handlers;

            eventStream.toggleSubscription("event",handler,true);

            handlers = eventStream.handlers["event"];

            expect(handlers.length).to.equal(1);

            //testing a callback is subscribed only once to the event

            eventStream.toggleSubscription("event",handler,true);

            handlers = eventStream.handlers["event"];

            expect(handlers.length).to.equal(1);

            //testing removing callback
            eventStream.toggleSubscription("event",handler,false);

            handlers = eventStream.handlers["event"];

            expect(handlers.length).to.equal(0);


            done();
        });

        it('it should allow to subscribe to event of type string', function(done) {

            eventStream.subscribe("event", function(data){});
            expect(eventStream.hasSubscribers("event")).to.be.true;
            done();
        });
    });


    describe("publish",()=>{
        it('it should throw an error when trying to publish event not of type string', function(done) {

            throws = function() {
                eventStream.publish({});
            };
            expect(throws).to.throw(EventStream.ERROR_PUBLISHING_EVENT_NAME_NOT_TYPE_STRING);

            throws = function() {
                eventStream.publish();
            };
            expect(throws).to.throw(EventStream.ERROR_PUBLISHING_EVENT_NAME_NOT_TYPE_STRING);

            throws = function() {
                eventStream.publish(null);
            };
            expect(throws).to.throw(EventStream.ERROR_PUBLISHING_EVENT_NAME_NOT_TYPE_STRING);

            done();
        });

        it('it should successfully publish event of type string to all the handlers', function(done) {

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

            eventStream.subscribe("event", handler1);
            eventStream.subscribe("event", handler2);

            eventStream.publish("event");

            function completeTest(){

                expect(noOfhandlersCalled).to.equal(2);
                done();
            }

        });

        it('it should successfully call all the handlers with published data', function(done) {

            var eventData = {};
            eventStream.subscribe("event", function(data){

                expect(data).to.equal(eventData);
                done();

            });

            eventStream.publish("event",eventData);

        });
    });


    describe("unSubscribe",()=>{
        it('it should throw an error when trying to unsubscribe from an event not of type string', function(done) {
            throws = function() {
                eventStream.unSubscribe({});
            };
            expect(throws).to.throw(EventStream.ERROR_UNSUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

            throws = function() {
                eventStream.unSubscribe();
            };
            expect(throws).to.throw(EventStream.ERROR_UNSUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

            throws = function() {
                eventStream.unSubscribe(null);
            };
            expect(throws).to.throw(EventStream.ERROR_UNSUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

            done();
        });

        it('it should throw an error when no handler is passed while unsubscribing to an event', function(done) {

            throws = function() {
                eventStream.unSubscribe("event");
            };

            expect(throws).to.throw(EventStream.ERROR_NO_HANDLER_WHILE_UNSUBSCRIBING);

            throws = function() {
                eventStream.unSubscribe("event",null);
            };

            expect(throws).to.throw(EventStream.ERROR_NO_HANDLER_WHILE_UNSUBSCRIBING);

            done();
        });

        it('it should throw an error when trying to unsubscribe with handler not of type function', function(done) {

            throws = function() {
                eventStream.unSubscribe("event",{});
            };
            expect(throws).to.throw(EventStream.ERROR_UNSUBSCRIBING_HANDLER_NOT_TYPE_FUNCTION);
            done();
        });

        it('it should allow to unsubscribe an handler for an event if it is registered', function(done) {

            var handler1 = function(data){};

            var handler2 = function(data){};

            eventStream.subscribe("event", handler1);
            eventStream.subscribe("event", handler2);

            expect(eventStream.hasSubscribers("event")).to.be.true;

            eventStream.unSubscribe("event",handler1);

            var handlers = eventStream.handlers["event"];
            expect(handlers.length).to.equal(1);

            done();
        });
    });

    describe("unSubscribeAll",()=>{
        it('it should throw an error when trying to unsubscribe from an event not of type string', function(done) {
            throws = function() {
                eventStream.unSubscribeAll({});
            };
            expect(throws).to.throw(EventStream.ERROR_UNSUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

            throws = function() {
                eventStream.unSubscribeAll();
            };
            expect(throws).to.throw(EventStream.ERROR_UNSUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

            throws = function() {
                eventStream.unSubscribeAll(null);
            };
            expect(throws).to.throw(EventStream.ERROR_UNSUBSCRIBING_EVENT_NAME_NOT_TYPE_STRING);

            done();
        });
        it('it should allow to unsubscribe all handlers for an event', function(done) {

            var handler1 = function(data){

            };

            var handler2 = function(data){
            };


            eventStream.subscribe("event", handler1);
            eventStream.subscribe("event", handler2);

            expect(eventStream.hasSubscribers("event")).to.be.true;

            eventStream.unSubscribeAll("event");

            expect(eventStream.hasSubscribers("event")).to.be.false;

            done();
        });
    });

});
