/*

observer.js - Demonstration of the "Observer" pattern (publish/subscribe)

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

var subject = function subject(observers) {
    observers = observers || [];
    return function subject_beh(msg, ctx) {
        if (msg.action === 'notify') {
            // send event to each observer
            observers.forEach(function (observer) {
                observer(msg.event);
            });
        } else if (msg.action === 'attach') {
            // attach new observer
            observers.push(msg.observer);
        } else if (msg.action === 'detach') {
            // detach first matching observer
            var i = observers.indexOf(msg.observer);
            observers.splice(i, 1);
        }
    };
};

var observer = function observer(label) {
    return function observer_beh(msg, ctx) {
        console.log(label, msg);
//      console.log(label, msg, ctx);
//      console.log(label, msg, this);
    };
};

var obsA = config.create(observer('<A>'));
var obsB = config.create(observer('<B>'));
//var obsC = config.create(observer('<C>'));
var obsC = config.create(function (msg) { console.log('<C>', msg); });
var subj = config.create(subject([obsA, obsB]));
subj({ action:'notify', event:1});
subj({ action:'attach', observer:obsC });
subj({ action:'notify', event:2 });
subj({ action:'detach', observer:obsA });
subj({ action:'notify', event:3 });
