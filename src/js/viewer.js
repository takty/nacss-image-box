/**
 *
 * Viewer (JS)
 *
 * @author Takuto Yanagida
 * @version 2021-10-18
 *
 */


window['NACSS'] = window['NACSS'] ?? {};


(function (NS) {

	(function () {
		// @include _inside.js
		NS.viewer = initialize;
	})();

	// @include _hash.js
	// @include _touch.js
	// @include _utilities.js

})(window['NACSS']);
