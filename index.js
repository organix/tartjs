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
    var sponsor = this;
    var deliver = function deliver (event) {
        var behavior = event.context.behavior;
        var self = event.context.self;
        self.event = event;
        try {
            // invoke behavior on actor
            behavior.call(self, event.message);
        } catch (ex) {
            // restore previous behavior
            event.context.behavior = behavior;
        }
        delete self.event;
    };
    var create = function create (behavior) {
        var context = {
            behavior: behavior,
            sponsor: sponsor
        };
        var actor = function (message) {
            var event = {
                message: message,
                context: context
            };
            setImmediate(deliver, event);
        };
        context.self = actor;
        return actor;
    };
    sponsor.create = create;
    Object.freeze(sponsor);
};