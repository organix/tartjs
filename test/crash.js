/*

crash.js - actor crash test

The MIT License (MIT)

Copyright (c) 2013-2015 Dale Schumacher, Tristan Slominski

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

test['actor crash should not crash es6Tweet configuration/sponsor'] = test =>
{
    test.expect(10);
    const sponsor = tart.es6Tweet();

    const crashingActor = count =>
    {
        return message =>
        {
            count--;
            test.ok(true);
            if (count > 0)
            {
                throw new Error("boom!");
            }
            test.done();
        };
    };

    const crasher = sponsor(crashingActor(10));

    for (let i = 0; i < 10; i++)
    {
        crasher('explode');
    }
};

test['actor crash should not crash the configuration/sponsor'] = function (test) {
    test.expect(10);
    var sponsor = tart.minimal();

    var crashingActor = function (count) {
        return function crashingActorBeh(message) {
            count--;
            test.ok(true);
            if (count > 0) {
                throw new Error("boom!");
            }
            test.done();
        };
    };

    var crasher = sponsor(crashingActor(10));

    for (var i = 0; i < 10; i++) {
        crasher('explode');
    }
};
