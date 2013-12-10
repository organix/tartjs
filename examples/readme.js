/*

readme.js - readme example script

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

var sponsor = tart.sponsor();

// create an actor that has no state
var statelessActor = sponsor(function (message) {
    console.log('got message', message); 
});

// create an actor with state
var statefulActorBeh = function (state) {
    return function (message) {
        console.log('got message', message);
        console.log('actor state', state);
    };
};

var statefulActor = sponsor(statefulActorBeh({some: 'state'}));

// create an actor with state that changes behavior
var flipFlop = function (state) {
    var firstBeh = function (message) {
        console.log('firstBeh got message', message);
        console.log('actor state', state);
        this.behavior = secondBeh;
    };
    var secondBeh = function (message) {
        console.log('secondBeh got message', message);
        console.log('actor state', state);
        this.behavior = firstBeh;
    };
    return firstBeh;
};

var serialActor = sponsor(flipFlop({some: 'state'}));

// create an actor that creates a chain of actors
var chainActorBeh = function (count) {
    return function (message) {
        console.log('chain actor', count);
        if (--count >= 0) {
            var next = this.sponsor(chainActorBeh(count));
            next(message);
        }
    }; 
};

var chainActor = sponsor(chainActorBeh(10));

// send messages to the actors
statelessActor('some message');
statefulActor({some: 'other message'});
serialActor('first message');
serialActor('second message');
serialActor('third message');
serialActor('fourth message');
chainActor('go');