/*
 * TartJS -- Tiny Actor Run-Time
 */
/*global tart invokeLater */
if (typeof setImmediate === 'function') {
	invokeLater = function (fn) { setImmediate(fn); }
} else if (typeof setTimeout === 'function') {
	invokeLater = function (fn) { setTimeout(fn, 0); }
}
console.log('invokeLater:', invokeLater);
tart = (function () {
    var tart = {};
    tart.config = function config(options) {
		options = options || {};
		var dispatch = options.dispatch || invokeLater;
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
