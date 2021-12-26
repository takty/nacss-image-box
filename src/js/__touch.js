/**
 *
 * Functions for Touch Support
 *
 * @author Takuto Yanagida
 * @version 2021-10-18
 *
 */


function getTouchPoint(ts) {
	const pxo = window.pageXOffset, pyo = window.pageYOffset;
	let x = 0, y = 0;
	if (ts.length === 1) {
		x = ts[0].pageX - pxo;
		y = ts[0].pageY - pyo;
	} else if (2 <= ts.length) {
		x = (ts[0].pageX + ts[1].pageX) / 2 - pxo;
		y = (ts[0].pageY + ts[1].pageY) / 2 - pyo
	}
	return [x, y];
}

function touchDistance(ts) {
	const x1 = ts[0].screenX, y1 = ts[0].screenY;
	const x2 = ts[1].screenX, y2 = ts[1].screenY;
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function preventWindowTouchMove(f) {
	let isTouching = false;
	window.addEventListener('touchmove', (e) => {
		if (!isTouching) return;
		e.preventDefault();
		e.stopImmediatePropagation();
	}, { passive: false });
	f.addEventListener('touchstart', () => { isTouching = true; });
	f.addEventListener('touchend', () => { isTouching = false; });
}

function getCursorPoint(e) {
	return [e.pageX - window.pageXOffset, e.pageY - window.pageYOffset];
}
