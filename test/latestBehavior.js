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

    var firstBeh = function firstBeh (event) {
        event.become(secondBeh);
        test.equal(event.message, 'foo');
        test.ok(!event.data.first);
        event.data.first = true;
        event.sponsor.send(event.target, event.message);
        event.sponsor.send(event.target, event.message);
    };

    var secondBeh = function secondBeh (event) {
        event.become(thirdBeh);
        test.equal(event.message, 'foo');
        test.ok(event.data.first);
        test.ok(!event.data.second);
        event.data.second = true;
    };

    var thirdBeh = function thirdBeh (event) {
        test.equal(event.message, 'foo');
        test.ok(event.data.first);
        test.ok(event.data.second);
        test.ok(!event.data.third);
        test.done();
    };

    var serial = config.createSerial(firstBeh, 
            {first: false, second: false, third: false});

    config.send(serial, 'foo');
};