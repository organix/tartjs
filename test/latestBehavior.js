/*

latestBehavior.js - latestBehavior edge case test

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

var Tart = require('../index.js');

var test = module.exports = {};

test["serial actor's latest behavior should be the one handling the next message"] = function (test) {
    test.expect(9);
    var config = new Tart();

    var firstBeh = function firstBeh (message, context) {
        context.behavior = secondBeh;
        test.equal(message, 'foo');
        test.ok(!context.state.first);
        context.state.first = true;
        context.self(message);
        context.self(message);
    };

    var secondBeh = function secondBeh (message, context) {
        context.behavior = thirdBeh;
        test.equal(message, 'foo');
        test.ok(context.state.first);
        test.ok(!context.state.second);
        context.state.second = true;
    };

    var thirdBeh = function thirdBeh (message, context) {
        test.equal(message, 'foo');
        test.ok(context.state.first);
        test.ok(context.state.second);
        test.ok(!context.state.third);
        test.done();
    };

    var serial = config.create(firstBeh, 
            {first: false, second: false, third: false});

    serial('foo');
};