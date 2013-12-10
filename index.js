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

var tart = module.exports;

/*
  * `options`: _Object_ _(Default: undefined)_
    * `fail`: _Function_ _(Default: `function (exception) {}`)_ 
        `function (exception) {}` An optional handler to call if a sponsored actor
        behavior throws an exception.
  * Return: _Function_ `function (behavior) {}` A capability to create new actors.

  Creates a sponsor capability to create new actors with.
*/
tart.sponsor = function sponsor(options) {
    options = options || {};
    var fail = options.fail || function (exception) {};

    /*
      * `behavior`: _Function_ `function (message) {}` Actor behavior to 
          invoke every time an actor receives a message.
      * Return: _Function_ `function (message) {}` Actor reference that can be 
          invoked to send the actor a message.            

      Creates a new actor and returns the actor reference in form of a capability
      to send that actor a message.      
    */
    var config = function create(behavior) {
        
        /*
          * `message`: _Any_ Any message.

          Asynchronously sends the `message` to the `actor`.
        */
        var actor = function send(message) {
            setImmediate(function deliver() {
                try {
                    context.behavior(message);
                } catch (exception) {
                    fail(exception);
                };
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

/*
  * `options`: _Object_ _(Default: undefined)_ Optional overrides.
    * `constructConfig`: _Function_ _(Default: `function (dispatch, deliver) {}`)_ 
        `function (dispatch, deliver) {}` Configuration creation function that 
        is given `dispatch` and `deliver`. It should return a capability 
        `function (behavior) {}` to create new actors.
    * `deliver`: _Function_ _(Default: `function (context) {}`)_ 
        `function (context) {}` Deliver function that creates a chain closures 
        around `context` and `message` and returns a function for `dispatch` to 
        dispatch.
    * `dispatch`: _Function_ _(Default: `setImmediate`)_ 
        `function (deliver) {}` Dispatch function for dispatching `deliver` 
        closures. 
    * `fail`: _Function_ _(Default: `function (exception) {}`)_ 
        `function (exception) {}` An optional handler to call if a sponsored actor
        behavior throws an exception. 
  * Return: _Function_ `function (behavior) {}` A capability to create new actors.

  Creates a sponsor capability to create new actors with and allows replacing
  parts of the implementation.
*/
tart.control = function sponsor(options) {
    options = options || {};
    var fail = options.fail || function (exception) {};

    options = options || {};
    var dispatch = options.dispatch || setImmediate;
    var deliver = options.deliver || function deliver(context) {
        return function deliver(message) {
            return function deliver() {
                try {
                    context.behavior(message);
                } catch (exception) {
                    fail(exception);
                }
            };
        };
    };
    var constructConfig = options.constructConfig || function constructConfig(dispatch, deliver) {
        var config = function create(behavior) {
            var actor = function send(message) {
                dispatch(deliver(context)(message));
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
    return constructConfig(dispatch, deliver);
};