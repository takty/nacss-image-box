/**
 *
 * Viewer
 *
 * @author Takuto Yanagida
 * @version 2021-11-19
 *
 */


window['NACSS'] = window['NACSS'] ?? {};


(function (NS) {

	(function () {
		// @include _touch.js
		// @include _image.js
		NS.viewerImage  = initializeImageViewer;
	})();

	(function () {
		// @include _iframe.js
		NS.viewerIframe = initializeIframeViewer;
	})();

	// @include _dialog.js

	// @include _hash.js
	// @include _style-class.js
	// @include _utilities.js

})(window['NACSS']);
