# tart

_Stability: 1 - [Experimental](https://github.com/tristanls/stability-index#stability-1---experimental)_

[![NPM version](https://badge.fury.io/js/tart.png)](http://npmjs.org/package/tart)

JavaScript implementation of [Tiny Actor Run-Time](https://github.com/organix/tart).

## Contributors

[@dalnefre](https://github.com/dalnefre), [@tristanls](https://github.com/tristanls)

## Overview

The goal of `tart` is to provide the smallest possible actor library in JavaScript that has the full power of a "pure" actor model of computation.

  * [Usage](#usage)
  * [Tests](#tests)
  * [Benchmarks](#benchmarks) 
  * [Documentation](#documentation)
  * [Sources](#sources)

`tart` also happens to fit into a tweet :D

    function(){var c=function(b){var a=function(m){setImmediate(function(){x.behavior(m)})},x={self:a,behavior:b,sponsor:c};return a};return c}

## Usage

To run the below example, run:

    npm run readme

```javascript
var tart = require('tart');

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
```

## Tests

    npm test

## Benchmarks

### Erlang Challenge

Erlang Challenge consists of creating a ring of M actors, sending N simple messages around the ring and increasing M until running out of resources. 

The benchmark implements a modified version of the challenge by creating 100,000 actors and running 10 simple messages around the ring.

    npm run erlangChallenge

### 100,000 actor ring

    starting 100000 actor ring
    sending 10 messages
    ..........
    done
    all times in NANOSECONDS
    construction time:
    336492833
    loop times:
    221762650
    212925428
    213672756
    215595649
    215465809
    216958143
    217696839
    221343351
    222385758
    226308376
    loop average:
    218411475.9

For rings of sizes larger than 4 Million you may need to expand memory available to V8. To do that, the following command will start the Erlang challenge with ~10GB of memory available:

    node --max_old_space_size=10000 scripts/erlangChallenge.js

### 30,000,000 actor ring

30 Million actor ring benchmark took up about ~8.5 GB of memory.

    starting 30000000 actor ring
    sending 1 messages
    .
    done
    all times in NANOSECONDS
    construction time:
    233098891645
    loop times:
    244265390009
    loop average:
    244265390009

## Documentation

### Tart

**Public API**

  * [tart.sponsor(\[fail\])](#tartsponsorfail)
  * [sponsor(behavior)](#sponsorbehavior)
  * [actor(message)](#actormessage)

### tart.sponsor([fail])

  * `fail`: _Function_ _(Default: `function (exception) {}`)_ `function (exception) {}` An optional handler to call if a sponsored actor behavior throws an exception.
  * Return: _Function_ `function (behavior) {}` A capability to create new actors.

Creates a sponsor capability to create new actors with.

```javascript
var tart = require('tart');
var sponsor = tart.sponsor();

var reportingSponsor = tart.sponsor(function (exception) {
    console.dir(exception);
});
```

### sponsor(behavior)

  * `behavior`: _Function_ `function (message) {}` Actor behavior to invoke every time an actor receives a message.
    * `message`: _Any_ Any message.
  * Return: _Function_ `function (message) {}` Actor reference in form of a capability that can be invoked to send the actor a message.
    * `message`: _Any_ Any message.

Creates a new actor and returns the actor reference in form of a capability to send that actor a message.

```javascript
var tart = require('tart');
var sponsor = tart.sponsor();
var actor = sponsor(function (message) {
    console.log('got message', message); 
    console.log(this.self);
    console.log(this.behavior);
    console.log(this.sponsor);
});
```

When the `behavior` is invoked upon the receipt of a message, it's `this` will be bound with the following:

  * `this.self`: _Function_ `function (message) {}` Reference to the actor that is executing the `behavior` (in form of a capability that can be invoked to send the actor a message).
    * `message`: _Any_ Any message.
  * `this.behavior`: _Function_ `function (message) {}` The behavior of the actor. To change actor behavior (a "become" operation) assign a new function to this parameter.
    * `message`: _Any_ Any message.
  * `this.sponsor`: _Function_ `function (behavior) {}` A capability to create new actors. To create a new actor call `this.sponsor(behavior)`
    * `behavior`: _Function_ `function (message) {}` Actor behavior to invoke every time an actor receives a message.
      * `message`: _Any_ Any message.

### actor(message)

  * `message`: _Any_ Any message.

Asynchronously sends the `message` to the `actor`.

```javascript
var tart = require('tart');
var sponsor = tart.sponsor();
var actor = sponsor(function behavior(message) {
    console.log('got message', message);
});
actor('hello actor world');
```

### Tracing

**Public API**

  * [tart.tracing(\[fail\])](#tarttracingfail)
  * [tracing.sponsor(behavior)](#tracingsponsorbehavior)
  * [tracing.dispatch()](#tracingdispatch)

### tart.tracing([fail])

  * `fail`: _Function_ _(Default: `function (exception) {}`)_ 
      `function (exception) {}` An optional handler to call if a sponsored actor behavior throws an exception.
  * Return: _Object_
    * `initial`: _Object_ Initial effect.
      * `created`: _Array_ An array of created contexts. A context is the execution context of an actor behavior.
      * `sent`: _Array_ An array of events. An events is a tuple containing a message and the context of the actor the message is addressed to.
    * `dispatch`: _Function_ `function () {}` Function to call in order to dispatch a single event.
      * Return: _Object_ or `false`. Effect of dispatching next event or `false` if no events exist for dispatch.
        * `created`: _Array_ An array of created contexts. A context is the execution context of an actor behavior.
        * `event`: _Object_ The event that was dispatched.
          * `message`: _Any_ Message that was delivered.
          * `context`: _Object_ Actor context the message was delivered to.
        * `exception`: _Error_ _(Default: undefined)_ An exception if message delivery caused an exception.
        * `previous`: _Function_ _(Default: undefined)_ `function (message) {}`If the actor changed behavior, the previous behavior is referenced here. The new actor behavior is in event.context.behavior
        * `sent`: _Array_ An array of events. An events is a tuple containing a message and the context of the actor the message is addressed to.
    * `sponsor`: _Function_ `function (behavior) {}` A capability to create new actors.
      * `behavior`: _Function_ `function (message) {}` Actor behavior to invoke every time an actor receives a message.
      * `message`: _Any_ Any message.

Create actor configuration/sponsor with tracing resources.

```javascript
var tart = require('tart');
var tracing = tart.tracing();

console.dir(tracing);
// { initial: { created: [], sent: [] },
//   dispatch: [Function: dispatch],
//   sponsor: [Function: create] }
```

### tracing.sponsor(behavior)

  * `behavior`: _Function_ `function (message) {}` Actor behavior to invoke every time an actor receives a message.
    * `message`: _Any_ Any message.
  * Return: _Function_ `function (message) {}` Actor reference that can be invoked to send the actor a message.        
    * `message`: _Any_ Any message.   

Creates a new (traced) actor and returns the actor reference in form of a capability to send that actor a message.

```javascript
var tart = require('tart');
var tracing = tart.tracing();
var actor = tracing.sponsor(function (message) {
    console.log('got message', message); 
    console.log(this.self);
    console.log(this.behavior);
    console.log(this.sponsor);
});
```

### tracing.dispatch()

  * Return: _Object_ or `false`. Effect of dispatching next event or `false` if no events exist for dispatch.
    * `created`: _Array_ An array of created contexts. A context is the execution context of an actor behavior.
    * `event`: _Object_ The event that was dispatched.
      * `message`: _Any_ Message that was delivered.
      * `context`: _Object_ Actor context the message was delivered to.
    * `exception`: _Error_ _(Default: undefined)_ An exception if message delivery caused an exception.
    * `previous`: _Function_ _(Default: undefined)_ `function (message) {}` If the actor changed behavior, the previous behavior is referenced here. The new actor behavior is in event.context.behavior
    * `sent`: _Array_ An array of events. An events is a tuple containing a message and the context of the actor the message is addressed to.

Dispatch next event.

```javascript
var tart = require('tart');
var tracing = tart.tracing();

var effect = tracing.initial;
console.dir(effect);
while ((effect = tracing.dispatch()) !== false) {
    console.dir(effect);
}
```

## Sources

  * [Tiny Actor Run-Time](https://github.com/organix/tart)