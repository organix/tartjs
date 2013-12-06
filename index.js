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
  * `fail`: _Function_ _(Default: `function (exception) {}`)_ 
      `function (exception) {}` An optional handler to call if a sponsored actor
      behavior throws an exception.
  * Return: _Function_ `function (behavior) {}` A capability to create new actors.
    * `behavior`: _Function_ `function (message) {}` Actor behavior to 
        invoke every time an actor receives a message.
      * `message`: _Any_ Any message.

  Create actor configuration/sponsor.
*/
tart.sponsor = function sponsor(fail) {
    fail = fail || function (exception) {}; // failure handler is optional
    /*
      * `behavior`: _Function_ `function (message) {}` Actor behavior to 
          invoke every time an actor receives a message.
        * `message`: _Any_ Any message.
      * Return: _Function_ `function (message) {}` Actor reference that can be 
          invoked to send the actor a message.        
        * `message`: _Any_ Any message.      

      Create a new actor.      
    */
    var config = function create(behavior) {
        
        /*
          * `message`: _Any_ Any message.

          Send message to the actor.
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
  * `fail`: _Function_ _(Default: `function (exception) {}`)_ 
      `function (exception) {}` An optional handler to call if a sponsored actor
      behavior throws an exception.
  * Return: _Object_
    * `initial`: _Object_ Initial effect.
      * `created`: _Array_ An array of created contexts. A context is the 
          execution context of an actor behavior.
      * `sent`: _Array_ An array of events. An events is a tuple containing a 
      message and the context of the actor the message is addressed to.
    * `dispatch`: _Function_ `function () {}` Function to call in order to
        dispatch a single event.
      * Return: _Object_ or `false`. Effect of dispatching next event or `false`
          if no events exist for dispatch.
        * `created`: _Array_ An array of created contexts. A context is the 
            execution context of an actor behavior.
        * `event`: _Object_ The event that was dispatched.
          * `message`: _Any_ Message that was delivered.
          * `context`: _Object_ Actor context the message was delivered to.
        * `exception`: _Error_ _(Default: undefined)_ An exception if message
            delivery caused an exception.
        * `previous`: _Function_ _(Default: undefined)_ `function (message) {}`
            If the actor changed behavior, the previous behavior is referenced
            here. The new actor behavior is in event.context.behavior
        * `sent`: _Array_ An array of events. An events is a tuple containing a 
            message and the context of the actor the message is addressed to.
    * `sponsor`: _Function_ `function (behavior) {}` A capability to create new 
        actors.
      * `behavior`: _Function_ `function (message) {}` Actor behavior to 
          invoke every time an actor receives a message.
      * `message`: _Any_ Any message.

  Create actor configuration/sponsor with tracing resources.
*/
tart.tracing = function tracing(fail) {
    fail = fail || function (exception) {}; // failure handler is optional
    var events = [];
    var effect = {
        created: [],
        sent: events // mechanism for bootstrapping initial configuration state
    };

    /*
      * Return: _Object_ or `false`. Effect of dispatching next event or `false`
          if no events exist for dispatch.
        * `created`: _Array_ An array of created contexts. A context is the 
            execution context of an actor behavior.
        * `event`: _Object_ The event that was dispatched.
          * `message`: _Any_ Message that was delivered.
          * `context`: _Object_ Actor context the message was delivered to.
        * `exception`: _Error_ _(Default: undefined)_ An exception if message
            delivery caused an exception.
        * `previous`: _Function_ _(Default: undefined)_ `function (message) {}`
            If the actor changed behavior, the previous behavior is referenced
            here. The new actor behavior is in event.context.behavior
        * `sent`: _Array_ An array of events. An events is a tuple containing a 
            message and the context of the actor the message is addressed to.

      Dispatch next event.
    */
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
        } catch (exception) {
            effect.exception = exception;
            fail(exception);
        }
        return effect;
    };

    /*
      * `behavior`: _Function_ `function (message) {}` Actor behavior to 
          invoke every time an actor receives a message.
        * `message`: _Any_ Any message.
      * Return: _Function_ `function (message) {}` Actor reference that can be 
          invoked to send the actor a message.        
        * `message`: _Any_ Any message.   

      Create a new (traced) actor.
    */
    var config = function create(behavior) {

        /*
          * `message`: _Any_ Any message.

          Send message to the actor.
        */
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