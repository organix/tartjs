# tartjs

_Stability: 1 - [Experimental](https://github.com/tristanls/stability-index#stability-1---experimental)_

[![NPM version](https://badge.fury.io/js/tartjs.png)](http://npmjs.org/package/tartjs)

JavaScript implementation of [Tiny Actor Run-Time](https://github.com/organix/tart).

## Contributors

[@dalnefre](https://github.com/dalnefre), [@tristanls](https://github.com/tristanls)

## Usage

```javascript
var Tart = require('tartjs');

var config = new Tart();

// create an actor that has no state and can't change behavior
var actor = config.createActor(function (event) {
    console.log('got message', event.message);
    console.dir(event);
});

// create a value actor that has state, but can't change behavior
var value = config.createValue(function (event) {
    console.log('got message', event.message); 
    console.log('actor state', event.data);
    console.dir(event);
}, {foo: 'bar'});

// create a serial actor that has state and can change behavior
var serial = config.createSerial(function (event) {
    console.log('got message', event.message);
    console.log('actor state', event.data);
    console.log('becoming something else');
    console.dir(event);
    
    event.sponsor.send(event.target, event.message);
    event.become(function (event) {
        console.log('got message with new behavior', event.message);
        console.dir(event);
    });
}, {foo: 'bar'});

config.send(actor, 'some message');
config.send(value, {some: 'other message'});
config.send(serial, {message: 'with', reference: actor});
```

## Tests

    npm test

## Benchmarks

### Erlang Challenge

Erlang Challenge consists of creating a ring of M actors, sending N simple messages around the ring and increasing M until running out of resources. 

The benchmark implements a modified version of the challenge by creating 100,000 actors and running 10 simple messages around the ring.

    npm run erlangChallenge
    constructed 100000 actor ring
    ..........
    done
    all times in NANOSECONDS
    construction time:
    2900829022
    loop times:
    627685921
    631848011
    666029990
    731236694
    775333540
    615891053
    612743213
    684856367
    721228999
    769791008
    611477526
    loop average:
    677102029.2727273

## Overview

The goal of `tartjs` is to provide the smallest possible actor library in JavaScript that has the full power of a "pure" actor model of computation.

### Configurations

*TODO*

### Actors

Actors consist only of behaviors and maintain no internal state. To create a new actor:

```javascript
var Tart = require('tartjs');
var config = new Tart();
var actor = config.createActor(function (event) { /* ... */ });
```

### Value Actors

Value actors consist of behaviors and state, but cannot change the behavior. To create a new value actor:

```javascript
var Tart = require('tartjs');
var config = new Tart();
var value = config.createValue(function (event) { /* ... */ }, { /* state */ });
```

### Serial Actors

Serial actors have state and can change their behaviors by using `event.become()` function. To create a new serial actor:

```javascript
var Tart = require('tartjs');
var config = new Tart();
var serial = config.createSerial(function (event) { /* ... */ }, { /* state */ });
```

## Documentation

*TODO*

## Sources

  * [Tiny Actor Run-Time](https://github.com/organix/tart)