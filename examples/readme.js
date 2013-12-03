var tart = require('../index.js');

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