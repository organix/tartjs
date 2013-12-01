var Tart = require('../index.js');

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
var firstBeh = function (state) {
    return function (message, context) {
        console.log('firstBeh got message', message);
        console.log('actor state', state);
        context.behavior = secondBeh(state);
    };
};

var secondBeh = function (state) {
    return function (message, context) {
        console.log('secondBeh got message', message);
        console.log('actor state', state);
        context.behavior = firstBeh(state);
    };  
};

var serialActor = config.create(firstBeh({some: 'state'}));

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