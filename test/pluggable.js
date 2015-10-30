/*

pluggable.js - pluggable configuration test

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

test['pluggable allows for alternate dispatch mechanism'] = function (test) {
    test.expect(2);
    var dispatch = function dispatch(deliver) {
        test.ok(deliver); 
        deliver(); // dispatch manually
    };

    var sponsor = tart.pluggable({dispatch: dispatch});

    var actor = sponsor(function (message) {
        test.equal(message, 'foo');
        test.done();
    });

    actor('foo');
};

test['pluggable allows for alternate deliver mechanism'] = function (test) {
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

    var sponsor = tart.pluggable({deliver: deliver});

    var actor = sponsor(function (message) {
        test.equal(message, 'foo');
    });

    actor('foo');
};

test['pluggable allows for alternate create mechanism'] = function (test) {
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

    var sponsor = tart.pluggable({constructConfig: constructConfig});

    var actor = sponsor(newBeh);
    actor('foo');
};

test['pluggable allows for actor annotation mechanism'] = function (test) {
    test.expect(2);

    var annotate = (function (n) {
        return function annotate(actor) {
            var id = '@' + n++;
            actor.toString = actor.inspect = function () {
                return id;
            };
            return actor;
        };
    })(0);

    var sponsor = tart.pluggable({annotate: annotate});

    var noop = function () {};
    var foo = sponsor(noop);
    var bar = sponsor(noop);

    test.equal('@0', foo.toString());
    test.equal('@1', bar.inspect());

    test.done();
};
