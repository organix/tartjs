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
    * [Tart](#tart-1)
    * [Control](#control)
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

The [Tart](#tart-1) implementation is the implementation optimized for fastest execution time. In contrast, [Control](#control) implementation allows for total control of the runtime and execution semantics. Although the default behavior of [Control](#control) is the same as [Tart](#tart-1), it is somewhat slower due to extra overhead incurred by pluggability of control and observability mechanisms.

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
  * Return: _Function_ `function (message) {}` Actor reference in form of a capability that can be invoked to send the actor a message.

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
  * `this.behavior`: _Function_ `function (message) {}` The behavior of the actor. To change actor behavior (a "become" operation) assign a new function to this parameter.
  * `this.sponsor`: _Function_ `function (behavior) {}` A capability to create new actors. To create a new actor call `this.sponsor(behavior)`.

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

### Control

**Public API**

  * [tart.control(\[fail\], \[options\])](#tartcontrolfail-options)
  * [sponsor(behavior)](#sponsorbehavior-1)
  * [actor(message)](#actormessage-1)

### tart.control([fail], [options])

  * `fail`: _Function_ _(Default: `function (exception) {}`)_ `function (exception) {}` An optional handler to call if a sponsored actor behavior throws an exception.
  * `options`: _Object_ _(Default: undefined)_ Optional overrides.
    * `constructConfig`: _Function_ _(Default: `function (dispatch, deliver) {}`)_ `function (dispatch, deliver) {}` Configuration creation function that is given `dispatch` and `deliver`. It should return a capability `function (behavior) {}` to create new actors.
    * `deliver`: _Function_ _(Default: `function (context) {}`)_ `function (context) {}` Deliver function that creates a chain closures around `context` and `message` and returns a function for `dispatch` to dispatch.
    * `dispatch`: _Function_ _(Default: `setImmediate`)_ `function (deliver) {}` Dispatch function for dispatching `deliver` closures.  
  * Return: _Function_ `function (behavior) {}` A capability to create new actors.

Creates a sponsor capability to create new actors with and allows replacing parts of the implementation.

```javascript
var tart = require('tart');

var dispatch = function (deliver) {
    console.log('delivering a message'); 
    deliver(); 
};

var deliver = function deliver(context) {
    return function deliver(message) {
        console.log('delivering message', message, 'to context', context);
        return function deliver() {
            try {
                context.behavior(message);
            } catch (exception) {
                console.log('got exception', exception);
            }
        };
    }; 
};

var constructConfig = function constructConfig(dispatch, deliver) {
    var config = function create(behavior) {
        var actor = function send(message) {
            dispatch(deliver(context)(message));
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

var sponsor = tart.control(null, {
    constructConfig: constructConfig,
    deliver: deliver,
    dispatch: dispatch
});

var actor = sponsor(function (message) {
    console.log('got message', message);
});

actor('foo');
```

### sponsor(behavior)

Same as the core [Tart](#tart-1) implementation. _See: [sponsor(behavior)](#sponsorbehavior)_

### actor(message)

Same as the core [Tart](#tart-1) implementation. _See: [actor(message)](#actormessage)_

## Sources

  * [Tiny Actor Run-Time](https://github.com/organix/tart)