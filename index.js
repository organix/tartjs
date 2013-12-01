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

var Tart = module.exports = function Tart () {};

/*
  * `behavior`: _Function_ `function (message, context) {}` Actor behavior to 
      invoke every time an actor receives a message.
    * `message`: _Any_ Any message.
    * `context`: _Object_
      * `self`: _Function_ Reference to the actor.
      * `behavior`: _Function_ The behavior of the actor. To change actor 
          behavior (a "become") assign a new function to this parameter.
      * `state`: _Object_ _**CAUTION: may be removed in future versions pending 
          experiment results**_ Actor state that persists through the lifetime 
          of the actor.
      * `sponsor`: _Object_ Sponsor of the actor. To create a new actor call 
          `context.sponsor.create()`.
  * `state`: _Object_ _(Default: undefined)_ _**CAUTION: may be removed in 
      future versions pending experiment results**_ Initial actor state that 
      will be passed in `context.state` to the `behavior` when the actor 
      receives a message.
  * Return: _Function_ `function (message) {}` Actor reference that can be 
      invoked to send the actor a message.
*/
Tart.prototype.create = function create (behavior, state) {
    var actor = function send (message) {
        setImmediate(function deliver() {
            context.behavior(message, context);
        });
    };
    var context = {
        self: actor,
        behavior: behavior,
        state: state,
        sponsor: this
    };
    return actor;
};