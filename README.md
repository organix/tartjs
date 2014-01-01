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
    * [Tweet](#tweet)
    * [Minimal](#minimal)
    * [Pluggable](#pluggable)
  * [Sources](#sources)

`tart` happens to fit into a tweet :D

    function(){var c=function(b){var a=function(m){setImmediate(function(){x.behavior(m)})},x={self:a,behavior:b,sponsor:c};return a};return c}

## Usage

To run the below example run:

    npm run readme

```javascript
"use strict";

var tart = require('../index.js');

var sponsor = tart.minimal();

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

Benchmarks were run on the [Minimal](#minimal) implementation.

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

The [Minimal](#minimal) implementation is the implementation optimized for fastest execution time. In contrast, [Pluggable](#pluggable) implementation allows for total control of the runtime and execution semantics. Although the default behavior of [Pluggable](#pluggable) is the same as [Minimal](#minimal), it is somewhat slower due to extra overhead incurred by pluggability of control and observability mechanisms.

  * [Tweet](#tweet)
  * [Minimal](#minimal)
  * [Pluggable](#pluggable)

### Tweet

**Public API**

  * [tart.tweet()](#tarttweet)
  * [sponsor(message)](#sponsormessage)
  * [actor(message)](#actormessage)

### tart.tweet()

Creates a sponsor capability to create new actors with using the Tweetable implementation :D.

WARNING: If an exception is thrown during message processing the Tweetable run-time will crash. For fastest stable implementation use [Minimal](#minimal).

### sponsor(message)

Same as the core [Minimal](#minimal) implementation. _See: [sponsor(message)](#sponsormessage-1)_

### actor(message)

Same as the core [Minimal](#minimal) implementation. _See: [actor(message)](#actormessage-1)_

### Minimal

**Public API**

  * [tart.minimal(\[options\])](#tartminimaloptions)
  * [sponsor(message)](#sponsormessage-1)
  * [actor(message)](#actormessage-1)

### tart.minimal([options])

  * `options`: _Object_ _(Default: undefined)_
    * `behavior`: _Function_ `function (message) {}` Actor behavior to invoke every time this sponsor receives a non-create message.  
    * `fail`: _Function_ _(Default: `function (exception) {}`)_ `function (exception) {}` An optional handler to call if a sponsored actor behavior throws an exception.
  * Return: _Function_ `function (message) {}` A capability to **synchronously** create new actors or send messages to the created sponsor.

Creates a sponsor capability to create new actors with and send messages to.

```javascript
var tart = require('tart');
var sponsor = tart.minimal();

var reportingSponsor = tart.minimal({
    fail: function (exception) {
        console.dir(exception);
    }
});
```

### sponsor(message)

  * `message`: _Any_ Any message.
  * Return: _void_ or _Function_ `function (message) {}`.

A capability to interact with the sponsor configuration.

If `message` is a `behavior`, **synchronously** creates an `actor` with the specified `behavior` and returns it immediately. 

If `message` is not a `behavior`, it is asynchronously sent to this sponsor.    

```javascript
var tart = require('tart');
var sponsor = tart.minimal();
var actor = sponsor(function (message) {
    console.log('got message', message); 
    console.log(this.self);
    console.log(this.behavior);
    console.log(this.sponsor);
});
```

_Note on created actors_: When the created actor's `behavior` is invoked upon the receipt of a message, it's `this` will be bound with the following:

  * `this.self`: _Function_ `function (message) {}` Reference to the actor that is executing the `behavior` (in form of a capability that can be invoked to send the actor a message).
  * `this.behavior`: _Function_ `function (message) {}` The behavior of the actor. To change actor behavior (a "become" operation) assign a new function to this parameter.
  * `this.sponsor`: _Function_ `function (message) {}` A capability to **synchronously** create new actors and send messages to the sponsor. To create a new actor call `this.sponsor(behavior)`.

### actor(message)

  * `message`: _Any_ Any message.

Asynchronously sends the `message` to the `actor`.

```javascript
var tart = require('tart');
var sponsor = tart.minimal();
var actor = sponsor(function behavior(message) {
    console.log('got message', message);
});
actor('hello actor world');
```

### Pluggable

**Public API**

  * [tart.pluggable(\[options\])](#tartpluggableoptions)
  * [sponsor(message)](#sponsormessage-2)
  * [actor(message)](#actormessage-2)

### tart.pluggable([options])

  * `options`: _Object_ _(Default: undefined)_ Optional overrides.
    * `behavior`: _Function_ `function (message) {}` Actor behavior to invoke every time this sponsor receives a non-create message.
    * `constructConfig`: _Function_ _(Default: `function (options) {}`)_ `function (options) {}` Configuration creation function that is given `options`. It should return a capability `function (message) {}` to create new actors and send messages to the created sponsor.
    * `deliver`: _Function_ _(Default: `function (context, message, options) {}`)_ `function (context, message, options) {}` Deliver function that returns a function for `dispatch` to dispatch.
    * `dispatch`: _Function_ _(Default: `setImmediate`)_ `function (deliver) {}` Dispatch function for dispatching `deliver` closures. 
    * `fail`: _Function_ _(Default: `function (exception) {}`)_ `function (exception) {}` An optional handler to call if a sponsored actor behavior throws an exception. 
  * Return: _Function_ `function (message) {}` A capability to **synchronously** create new actors or send messages to the created sponsor.

Creates a sponsor capability to create new actors with, send messages to, and allows replacing parts of the implementation.

To run the below example run:

    npm run pluggable

```javascript
var tart = require('tart');

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
    var config = function send(message) {
        // if `message` is an actor `behavior` do synchronous `create`
        if (arguments.length === 1 && typeof message === 'function') {
            var actor = function send(msg) {
                options.dispatch(options.deliver(context, msg, options));
            };
            var context = {
                self: actor,
                behavior: message,
                sponsor: config
            };
            console.log('created actor in context', context);
            return actor;
        }

        // asynchronously deliver the message to the sponsor
        options.dispatch(options.deliver(configContext, message, options));
    };

    var configContext = {
        self: config,
        behavior: options.behavior,
        sponsor: config
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
```

### sponsor(message)

Same as the core [Minimal](#minimal) implementation. _See: [sponsor(message)](#sponsorbehavior-1)_

### actor(message)

Same as the core [Minimal](#minimal) implementation. _See: [actor(message)](#actormessage-1)_

## Sources

  * [Tiny Actor Run-Time](https://github.com/organix/tart)