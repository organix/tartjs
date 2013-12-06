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

var tart = require('../index.js');

var sponsor = tart.sponsor(function (ex) { console.log('FAIL!', ex); });

var subject = function subject(observers) {
    observers = observers || [];
    return function subject_beh(msg) {
        if (msg.action === 'notify') {  // notify all observers concurrently
            observers.forEach(function (observer) {
                observer(msg.event);
            });
        } else if (msg.action === 'attach') {  // attach new observer
            observers.push(msg.observer);
        } else if (msg.action === 'detach') {  // detach first matching observer
            var i = observers.indexOf(msg.observer);
            observers.splice(i, 1);
        }
    };
};

var observer = function observer(label) {
    return function observer_beh(msg) {
//      console.log(label, msg);
        console.log(label, msg, this);
    };
};

var obsA = sponsor(observer('<A>'));
var obsB = sponsor(observer('<B>'));
var obsC = sponsor(observer('<C>'));
//var obsC = sponsor(function (msg) { console.log('<C>', msg); });
var subj = sponsor(subject([obsA, obsB]));
subj({ action:'notify', event:1 });
subj({ action:'attach', observer:obsC });
subj({ action:'notify', event:2 });
subj({ action:'detach', observer:obsA });
subj({ action:'notify', event:3 });

/*
    How about a subject that returns separate capabilities?
    
    WARNING: THE EXAMPLE BELOW IS _NOT_ SAFE!
*/

var tracing = tart.tracing();
sponsor = tracing.sponsor;

var subjectCaps = function (sponsor) {
    var observers = [];
    var notify = sponsor(function notify_beh(msg) {
        observers.forEach(function (observer) {
            observer(msg.event);
        });
        msg.customer(msg.event);  // ack
    });
    var attach = sponsor(function attach_beh(msg) {
        var o = msg.observer;
        observers.push(o);
        var detach = this.sponsor(function detach_beh(msg) {
            observers.splice(observers.indexOf(o), 1);
            msg.customer(o);  // ack
        });
        msg.customer(detach);
    });
    return { notify:notify, attach:attach };
};

var obsX = sponsor(function (msg) { console.log('<X>', msg); });
var obsY = sponsor(function (msg) { console.log('<Y>', msg); });
var caps = subjectCaps(sponsor);
caps.attach({
    observer: obsX,
    customer: sponsor(function (detachX) {
        caps.attach({
            observer: obsY,
            customer: sponsor(function (detachY) {
                caps.notify({
                    event: 'foo',
                    customer: sponsor(function (msg) {
                        console.log(msg, 'DONE.');
                    })
                });
                detachX({
                    customer: sponsor(function (o) {
                        caps.notify({
                            event: (o === obsX),
                            customer: sponsor(function (msg) {
                                console.log(msg, 'DONE.');
                            })
                        });
                    })
                });
            })
        });
    })
});

var effect = tracing.initial;
console.log("initial:", effect);
while ((effect = tracing.dispatch()) !== false) {
    console.log("effect:", effect);
}
