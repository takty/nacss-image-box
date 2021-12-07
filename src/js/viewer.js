/**
 *
 * Viewer
 *
 * @author Takuto Yanagida
 * @version 2021-12-07
 *
 */


window['NACSS'] = window['NACSS'] ?? {};


(function (NS) {

	{
		// @include _touch.js
		// @include _image.js
		NS.viewerImage  = initializeImageViewer;
	}

	{
		// @include _iframe.js
		NS.viewerIframe = initializeIframeViewer;
	}

	// @include _dialog.js
	// @include _hash.js

	// @include _style-class.js
	// @include _utility.js

})(window['NACSS']);
