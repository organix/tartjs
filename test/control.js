/*

control.js - control configuration test

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

var tart = require('../index.js');

var test = module.exports = {};

test['control allows for alternate dispatch mechanism'] = function (test) {
    test.expect(2);
    var dispatch = function dispatch(deliver) {
        test.ok(deliver); 
        deliver(); // dispatch manually
    };

    var sponsor = tart.control({dispatch: dispatch});

    var actor = sponsor(function (message) {
        test.equal(message, 'foo');
        test.done();
    });

    actor('foo');
};

test['control allows for alternate deliver mechanism'] = function (test) {
    test.expect(5);
    var deliver = function deliver(context, message, options) {
        test.ok(context);
        test.equal(message, 'foo');
        test.ok(options);
        return function deliver() {
            test.ok(true);
            try {
                context.behavior(message);
            } catch (exception) {
                test.equal(false, exception); // fail test
            }
            test.done();
        };
    };

    var sponsor = tart.control({deliver: deliver});

    var actor = sponsor(function (message) {
        test.equal(message, 'foo');
    });

    actor('foo');
};

test['control allows for alternate create mechanism'] = function (test) {
    test.expect(3);
    var newBeh = function newBeh(message) {
        test.equal(message, 'foo');
        test.done();
    };

    var constructConfig = function constructConfig(options) {
        test.ok(options);
        var config = function create(behavior) {
            test.strictEqual(behavior, newBeh);
            var actor = function send(message) {
                options.dispatch(options.deliver(context, message, options));
            };
            var context = {
                self: actor,
                behavior: behavior,
                sponsor: config
            };
            return actor;
        }
        return config;
    };

    var sponsor = tart.control({constructConfig: constructConfig});

    var actor = sponsor(newBeh);
    actor('foo');
};