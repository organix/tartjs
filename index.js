/*

index.js - "tartjs": Tiny Actor Run-Time in JavaScript

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

var Tart = module.exports = function Tart () {
    var self = this;

    self.sponsor = Object.freeze({
        createActor: function () { return self.createActor.apply(self, arguments); },
        createValue: function () { return self.createValue.apply(self, arguments); },
        createSerial: function () { return self.createSerial.apply(self, arguments); },
        fail: function () { self.fail.apply(self, arguments); },
        send: function () { self.send.apply(self, arguments); }
    });

    Object.freeze(self);
};

Tart.prototype.createActor = function createActor (behavior) {
    var ref = function (sponsor, message) {
        setImmediate(behavior, 
            {sponsor: sponsor, target: ref, message: message});
    };
    return Object.freeze(ref);
};

Tart.prototype.createValue = function createValue (behavior, data) {
    data = data || {};
    var ref = function (sponsor, message) {
        setImmediate(behavior,
            {sponsor: sponsor, target: ref, data: data, message: message});
    };
    return Object.freeze(ref);
};

Tart.prototype.createSerial = function createSerial (initialBehavior, data) {
    data = data || {};
    var serial = {
        currentBehavior: initialBehavior,
        nextBehavior: initialBehavior
    };
    var become = function (behavior) {
        serial.nextBehavior = behavior;
    };
    var ref = function (sponsor, message) {
        setImmediate(actSerial,
            {sponsor: sponsor, target: ref, data: data, message: message, 
                serial: serial, become: become});
    };
    return Object.freeze(ref);
};

Tart.prototype.send = function send (target, message) {
    var self = this;
    target(self.sponsor, message);
};

var actSerial = function actSerial (event) {
    var self = event.target;
    var serial = event.serial;
    serial.nextBehavior = serial.currentBehavior;
    serial.currentBehavior({sponsor: event.sponsor, target: event.target,
        data: event.data, message: event.message, become: event.become});
    serial.currentBehavior = serial.nextBehavior;
};

Object.freeze(Tart);