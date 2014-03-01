/*
 * TartJS -- Tiny Actor-RunTime
 */
/*global tart */
var tart = (function () {
    var tart = {};
    tart.config = function config(options) {
		options = options || {};
		var dispatch = options.dispatch || function (fn) { setTimeout(fn, 0); };
		var fail = options.fail || function (exception) {};
		var sponsor = function create(behavior) {
			var actor = function send(message) {
				dispatch(function deliver() {
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
				sponsor: sponsor
			};
			return actor;
		};
		return sponsor;
	};
    return tart;
})();
