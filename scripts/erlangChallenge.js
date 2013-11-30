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

var ring_link = function ring_link(next) {
	return function ring_link_beh(n) {
		next(n);
	};
};

var ring_last = function ring_last(first) {
	return function ring_last_beh(n) {
        loopCompletionTimes.push(process.hrtime());
		if (--n > 0) {
            process.stdout.write('.');
			first(n);
		} else {
			this.event.context.behavior = function sink_beh(msg) {};
			reportProcessTimes();
		}
	};
};

var ring_builder = function ring_builder(m) {
	return function ring_builder_beh(msg) {
		process.stdout.write(' msg=' + JSON.stringify(msg) + ' m=' + m +'\n');
		if (--m > 0) {
			var next = this.event.context.sponsor.create(ring_builder(m));
			next(msg);
			this.event.context.behavior = rink_link(next);
		} else {
            constructionEndTime = process.hrtime();
			process.stdout.write('sending ' + msg.n + ' messages\n');
			msg.first(msg.n);
			this.event.context.behavior = rink_last(msg.first);
		}
	};
};

var ringMemberBeh = function () {
    var next = null;
    return function (msg) {
        if (msg.name == 'build') {
            if (msg.counter > 0) {
                next = this.event.context.sponsor.create(ringMemberBeh());
                msg.counter--;
                next(msg);
            } else {
                next = msg.seed;
                next('start');
            }
        } else {
            next(msg);
        }
    };
};

var seedBeh = function () {
    var next = null;
    return function (msg) {
        if (msg == 'build') {
            next = this.event.context.sponsor.create(ringMemberBeh());
            next({name: 'build', counter: M - 1, seed: this});
        } else if (msg == 'start') {
            constructionEndTime = process.hrtime();
            console.log('constructed ' + M + ' actor ring');
            next(N);
        } else if (msg > 0) {
            loopCompletionTimes.push(process.hrtime());
            // keep sending
            process.stdout.write('.');
            msg--;
            next(msg);
        } else {
            loopCompletionTimes.push(process.hrtime());
			reportProcessTimes();
        }            
    };
};

var reportProcessTimes = function () {
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
};

console.log('starting ' + M + ' actor ring');
constructionStartTime = process.hrtime();
var seed = config.create(seedBeh());
seed('build');
//var ring = config.create(ring_builder(M));
//ring({ first:ring, n:N });
