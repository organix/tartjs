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

module.exports.sponsor = function () {
    var config = function create(behavior) {
        var actor = function send(message) {
            setImmediate(function deliver() {
                try {
                    context.behavior(message);
                } catch (ex) {
                    console.log('FAIL!', ex);
                }
            });
        };
        var context = {
            self: actor,
            behavior: behavior,
            sponsor: config
        };
        return actor;
    };
    return config;
};

module.exports.tracing = function () {
    var events = [];
    var effect = {
        created: [],
        sent: events
    };
    var dispatch = function dispatch() {
        var event = events.shift();
        if (!event) {
            return false;
        }
        effect = {
            event: event,
            created: [],
            sent: []
        };
        try {
            var previous = event.context.behavior;
            event.context.behavior(event.message);
            if (previous !== event.context.behavior) {
                effect.previous = previous;
            }
            Array.prototype.push.apply(events, effect.sent);
        } catch (ex) {
            effect.exception = ex;
        }
        return effect;
    };
    var config = function create(behavior) {
        var actor = function send(message) {
            var event = {
                message: message,
                context: context
            };
            effect.sent.push(event);
        };
        var context = {
            self: actor,
            behavior: behavior,
            sponsor: config
        };
        effect.created.push(context);
        return actor;
    };
    return {
        initial: effect,
        dispatch: dispatch,
        sponsor: config
    };
};
