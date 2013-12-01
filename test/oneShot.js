/*

oneShot.js - one-shot pattern test

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

test['one shot actor should forward the first message and become sink afterwards'] = function (test) {
    test.expect(2);
    var config = new Tart();

    var destination = config.create(function (msg, ctx) {
        test.equal(msg, 'first');
        testComplete('destinationDone');
    });

    var oneShot = config.create((function () {
        var dest = destination;
        return function (msg, ctx) {
            ctx.behavior = function (msg, ctx) {
                test.equal(msg, 'second');
                testComplete('sinkBehDone');
            };
            dest(msg);
        };
    })());

    var testComplete = config.create((function () {
        var sinkBehDone = false;
        var destinationDone = false;
        return function (msg, ctx) {
            if (msg == 'sinkBehDone') {
                sinkBehDone = true;
            } else if (msg == 'destinationDone') {
                destinationDone = true;
            }
            if (sinkBehDone && destinationDone) {
                test.done();
            }
        };
    })());

    oneShot('first');
    oneShot('second');
};