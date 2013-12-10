/*

pluggable.js - pluggable example script

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

var dispatch = function (deliver) {
    console.log('delivering a message'); 
    deliver(); 
};

var deliver = function deliver(context, message, options) {
    console.log('delivering message', message, 'to context', context);
    return function deliver() {
        try {
            context.behavior(message);
        } catch (exception) {
            console.log('got exception', exception);
        }
    };
};

var constructConfig = function constructConfig(options) {
    var config = function create(behavior) {
        var actor = function send(message) {
            options.dispatch(options.deliver(context, message, options));
        };
        var context = {
            self: actor,
            behavior: behavior,
            sponsor: config
        };
        console.log('created actor in context', context);
        return actor;
    };
    return config;
};

var sponsor = tart.pluggable({
    constructConfig: constructConfig,
    deliver: deliver,
    dispatch: dispatch
});

var actor = sponsor(function (message) {
    console.log('got message', message);
});

actor('foo');