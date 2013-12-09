/*

tracing.js - tracing configuration test

The MIT License (MIT)

Copyright (c) 2013 Dale Schumacher, Tristan Slominski

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";

var tart = require('../examples/tracing.js');

var test = module.exports = {};

test['tracing should return an initial state prior to any dispatch'] = function (test) {
    test.expect(6);
    var tracing = tart.tracing();

    var actor = tracing.sponsor(function (message) {});
    var actor2 = tracing.sponsor(function (message) {});
    actor(actor2);

    test.equal(tracing.initial.created.length, 2);
    test.strictEqual(tracing.initial.created[0].self, actor);
    test.strictEqual(tracing.initial.created[1].self, actor2);
    test.equal(tracing.initial.sent.length, 1);
    test.strictEqual(tracing.initial.sent[0].message, actor2);
    test.strictEqual(tracing.initial.sent[0].context.self, actor);
    test.done();
};

test['tracing should dispatch one event on dispatch() call'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();

    var dispatched = false;
    var testBeh = function testBeh(message) {
        test.equal(message, 'foo');
        dispatched = true;
    };

    var actor = tracing.sponsor(testBeh);
    actor('foo');

    test.ok(!dispatched);
    tracing.dispatch();
    test.ok(dispatched);
    test.done();
};

test['dispatch returns an effect of actor processing the message'] = function (test) {
    test.expect(6);
    var tracing = tart.tracing();

    var createdBeh = function createdBeh(message) {};
    var becomeBeh = function becomeBeh(message) {};

    var testBeh = function testBeh(message) {
        var actor = this.sponsor(createdBeh); // create
        actor('foo'); // send
        this.behavior = becomeBeh; // become
    };

    var actor = tracing.sponsor(testBeh);
    actor('bar');

    var effect = tracing.dispatch();
    test.strictEqual(effect.created[0].behavior, createdBeh);
    test.equal(effect.event.message, 'bar');
    test.equal(effect.sent[0].message, 'foo');
    test.strictEqual(effect.previous, testBeh);
    test.strictEqual(effect.event.context.behavior, becomeBeh);
    test.ok(!effect.exception);
    test.done();
};

test['dispatch returns an effect containing exception if actor throws one'] = function (test) {
    test.expect(1);
    var tracing = tart.tracing();

    var exception;

    var crashBeh = function crashBeh(message) {
        exception = new Error('boom');
        throw exception;
    };

    var actor = tracing.sponsor(crashBeh);
    actor('explode');

    var effect = tracing.dispatch();
    test.strictEqual(effect.exception, exception);
    test.done();
};

test["dispatch returns 'false' if no events to dispatch"] = function (test) {
    test.expect(1);
    var tracing = tart.tracing();

    var effect = tracing.dispatch();
    test.strictEqual(effect, false);
    test.done();
};

test["dispatch calls the configuration fail handler if actor throws an exception"] = function (test) {
    test.expect(1);
    var exception;

    var tracing = tart.tracing(function (ex) {
        test.strictEqual(ex, exception);
        test.done();
    });

    var crashBeh = function crashBeh(message) {
        exception = new Error('boom');
        throw exception;
    };

    var actor = tracing.sponsor(crashBeh);
    actor('explode');

    tracing.dispatch();
};