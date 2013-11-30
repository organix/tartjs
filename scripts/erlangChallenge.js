/*

erlangChallenge.js - Joe Armstrong's Erlang challenge:
                        Create a ring of M processes
                        Send N simple messages around the ring
                        Increase M until out of resources

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

var M = 100000;
var N = 10;

var constructionStartTime;
var constructionEndTime;
var loopCompletionTimes = [];

var Tart = require('../index.js');

var config = new Tart();

var ringMemberBeh = function ringMemberBeh (event) {
    if (event.message.name == 'build') {
        if (event.message.counter > 0) {
            event.data.next = event.sponsor.createValue(ringMemberBeh);
            event.message.counter--;
            event.sponsor.send(event.data.next, event.message);
        } else {
            event.data.next = event.message.seed;
            event.sponsor.send(event.data.next, 'start');
        }
    } else {
        // forward to next
        event.sponsor.send(event.data.next, event.message);
    }
};

var seed = config.createValue(function (event) {
    if (event.message == 'build') {
        event.data.next = event.sponsor.createValue(ringMemberBeh);
        event.sponsor.send(event.data.next, {
            name: 'build',
            counter: M - 1,
            seed: event.target
        });
    } else if (event.message == 'start') {
        constructionEndTime = process.hrtime();
        console.log('constructed ' + M + ' actor ring');
        event.sponsor.send(event.data.next, N);
    } else if (event.message > 0) {
        loopCompletionTimes.push(process.hrtime());
        // keep sending
        process.stdout.write('.');
        event.message--;
        event.sponsor.send(event.data.next, event.message);
    } else {
        loopCompletionTimes.push(process.hrtime());
        process.stdout.write('\ndone\n');
        var constructionTime = [];
        constructionTime[0] = constructionEndTime[0] - constructionStartTime[0];
        constructionTime[1] = constructionEndTime[1] - constructionStartTime[1];
        console.log('all times in NANOSECONDS');
        console.log('construction time:');
        console.log(constructionTime[0] * 1e9 + constructionTime[1]);
        console.log('loop times:');
        var loopIntervals = [];
        var prevTime = constructionEndTime;
        var counter = 0;
        loopCompletionTimes.forEach(function(time) {
            counter++;
            var interval = [];
            interval[0] = time[0] - prevTime[0];
            interval[1] = time[1] - prevTime[1];
            console.log(interval[0] * 1e9 + interval[1]);
            loopIntervals.push(interval);
            prevTime = time;
        });
        console.log('loop average:');
        var avgInterval = [0, 0];
        loopIntervals.forEach(function(interval) {
            avgInterval[0] += interval[0];
            avgInterval[1] += interval[1];
        });
        avgInterval[0] = avgInterval[0] / counter;
        avgInterval[1] = avgInterval[1] / counter;
        console.log(avgInterval[0] * 1e9 + avgInterval[1]);        
    }
});

constructionStartTime = process.hrtime();
config.send(seed, 'build');