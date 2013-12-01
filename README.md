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

    function C(){}.prototype.a=function (b,x){var a=function (m){setImmediate(function (){c.b(m, c);});};var c={a:a,b:b,x:x,s:this};return a;};

## Usage

To run the below example, run:

    npm run examples-readme

```javascript
var Tart = require('tart');

var config = new Tart();

// create an actor that has no state
var statelessActor = config.create(function (message) {
    console.log('got message', message); 
});

// create an actor with state
var statefulActorBeh = function (state) {
    return function (message) {
        console.log('got message', message);
        console.log('actor state', state);
    };
};

var statefulActor = config.create(statefulActorBeh({some: 'state'}));

// create an actor with state that changes behavior
var flipFlop = function (state) {
    var firstBeh = function (message, context) {
        console.log('firstBeh got message', message);
        console.log('actor state', state);
        context.behavior = secondBeh;
    };
    var secondBeh = function (message, context) {
        console.log('secondBeh got message', message);
        console.log('actor state', state);
        context.behavior = firstBeh;
    };
    return firstBeh;
};

var serialActor = config.create(flipFlop({some: 'state'}));

// create an actor that creates a chain of actors
var chainActorBeh = function (count) {
    return function (message, context) {
        console.log('chain actor', count);
        if (--count >= 0) {
            var next = context.sponsor.create(chainActorBeh(count));
            next(message);
        }
    }; 
};

var chainActor = config.create(chainActorBeh(10));

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

**Public API**

  * [new Tart()](#new-tart)
  * [tart.create(behavior, \[state\])](#tartcreatebehavior-state)

### new Tart()

Creates a new instance of Tart.

### tart.create(behavior, [state])

  * `behavior`: _Function_ `function (message, context) {}` Actor behavior to invoke every time an actor receives a message.
    * `message`: _Any_ Any message.
    * `context`: _Object_
      * `self`: _Function_ Reference to the actor.
      * `behavior`: _Function_ The behavior of the actor. To change actor behavior (a "become") assign a new function to this parameter.
      * `state`: _Object_ _**CAUTION: may be removed in future versions pending experiment results**_ Actor state that persists through the lifetime of the actor.
      * `sponsor`: _Object_ Sponsor of the actor. To create a new actor call `context.sponsor.create()`.
  * `state`: _Object_ _(Default: undefined)_ _**CAUTION: may be removed in future versions pending experiment results**_ Initial actor state that will be passed in `context.state` to the `behavior` when the actor receives a message.
  * Return: _Function_ `function (message) {}` Actor reference that can be invoked to send the actor a message.

Creates a new actor with the specified behavior.

## Sources

  * [Tiny Actor Run-Time](https://github.com/organix/tart)