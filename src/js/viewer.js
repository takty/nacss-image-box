/**
 *
 * Viewer (JS)
 *
 * @author Takuto Yanagida
 * @version 2021-11-11
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
	// @include _style-class.js
	// @include _utilities.js

})(window['NACSS']);
