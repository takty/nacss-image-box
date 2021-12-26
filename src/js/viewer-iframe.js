/**
 *
 * Viewer
 *
 * @author Takuto Yanagida
 * @version 2021-12-26
 *
 */


window['NACSS']           = window['NACSS']           || {};
window['NACSS']['viewer'] = window['NACSS']['viewer'] || {};


((NS) => {

	// @include __hash.js
	// @include __style-class.js
	// @include __utility.js

	// @include _iframe.js
	NS.applyIframe = apply;

	// @include _dialog.js

})(window['NACSS']['viewer']);
