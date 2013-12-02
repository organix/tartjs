/*

forkJoin.js - Demonstration of the parallel processing (fork/join)

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

var config = new Tart();

var fork = function fork(customer, serviceList) {
    return function fork_beh(requestList, ctx) {
        var count = serviceList.length;
        if ((requestList.length != count) || (count < 1)) {
            throw new Error('bad count: ' + count);
        }
        var replyList = new Array(count);
        var join = function join(index) {
            return function join_beh(reply, ctx) {
                replyList[index] = reply;
                if (--count < 1) {
                    customer(replyList);
                }
            };
        };
        serviceList.forEach(function (service, index) {
            var k_join = ctx.sponsor.create(join(index));
            var request = requestList[index];
            request.customer = k_join;
            service(request);
        });
    };
};

var service = function service(label) {
    return function service_beh(req, ctx) {
        req.customer({ label:label, input:req.input });
    };
};

var svcA = config.create(service('<A>'));
var svcB = config.create(service('<B>'));
var svcC = config.create(service('<C>'));

var output = config.create(function (msg) { console.log('output: ', msg); });

var par = config.create(fork(output, [svcA, svcB, svcC]));

par([{ input:1 }, { input:2 }, { input:3 }]);
