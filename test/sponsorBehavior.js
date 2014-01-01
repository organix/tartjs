/*

sponsorBehavior.js - sponsor behavior test

The MIT License (MIT)

Copyright (c) 2014 Dale Schumacher, Tristan Slominski

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

var tart = require('../index.js');

var test = module.exports = {};

test['minimal sponsor behavior should be invoked with a message'] = function (test) {
    test.expect(1);

    var testMessage = {selector: 'foo'};

    var sponsor = tart.minimal({behavior: function (message) {
        test.deepEqual(message, testMessage);
        test.done();
    }});

    sponsor(testMessage);
};

test['minimal sponsor behavior crashing should be ignored by tart.minimal by default'] = function (test) {
    test.expect(2);

    var sponsor = tart.minimal({behavior: function (message) {
        test.ok(message);
        setImmediate(function () {
            test.done();
        });
        throw new Error('boom!');
    }});

    test.doesNotThrow(function () {
        sponsor('foo');
    }, Error);
};

test['minimal sponsor behavior failure should call fail handler handed to sponsor on construction'] = function (test) {
    test.expect(1);
    var failHandler = function failHandler (exception) {
        test.equal(exception.message, "boom!");
        test.done();
    };
    var sponsor = tart.minimal({
        behavior: function failingBeh(message) {
            throw new Error('boom!');
        },
        fail: failHandler
    });

    sponsor('go');    
};


test['pluggable sponsor behavior should be invoked with a message'] = function (test) {
    test.expect(1);

    var testMessage = {selector: 'foo'};

    var sponsor = tart.pluggable({behavior: function (message) {
        test.deepEqual(message, testMessage);
        test.done();
    }});

    sponsor(testMessage);
};

test['pluggable sponsor behavior crashing should be ignored by tart.minimal by default'] = function (test) {
    test.expect(2);

    var sponsor = tart.pluggable({behavior: function (message) {
        test.ok(message);
        setImmediate(function () {
            test.done();
        });
        throw new Error('boom!');
    }});

    test.doesNotThrow(function () {
        sponsor('foo');
    }, Error);
};

test['pluggable sponsor behavior failure should call fail handler handed to sponsor on construction'] = function (test) {
    test.expect(1);
    var failHandler = function failHandler (exception) {
        test.equal(exception.message, "boom!");
        test.done();
    };
    var sponsor = tart.pluggable({
        behavior: function failingBeh(message) {
            throw new Error('boom!');
        },
        fail: failHandler
    });

    sponsor('go');    
};