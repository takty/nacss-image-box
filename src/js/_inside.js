/**
 *
 * Viewer (JS)
 *
 * @author Takuto Yanagida
 * @version 2021-10-19
 *
 */


function initialize(as = [], opts = {}) {
	if (as.length === 0) return;
	const cm = Object.assign({
		styleOpener       : ':ncViewerOpener',
		styleOpenerWrapper: ':ncViewerOpenerWrapper',

		styleRoot   : ':ncViewer',
		styleCloser : ':ncViewerCloser',
		stylePrev   : ':ncViewerPrev',
		styleNext   : ':ncViewerNext',
		styleCaption: ':ncViewerCaption',

		styleOpen     : ':ncOpen',
		styleVisible  : ':ncVisible',
		styleInstantly: ':ncInstantly',
		styleLoaded   : ':ncLoaded',

		maxZoomRate: 10,
		hashPrefix : 'viewer:',

		curId: null,
	}, opts);

	const objs = [];
	for (const a of as) objs.push(createViewer(cm, a));

	onResize(() => {
		for (const obj of objs) setInitialSize(obj);
		setTimeout(() => {
			for (const obj of objs) setInitialSize(obj);
		}, 200);
	});
	window.addEventListener('keydown', e => {
		if (cm.curId === null) return;
		const cur   = objs[cm.curId];
		const noMod = !e.altKey && !e.ctrlKey && !e.shiftKey;
		if (e.key === 'Escape' && noMod) cur._frm.click();
		else if (e.key === 'ArrowLeft' && noMod) cur._btnPrev.click();
		else if (e.key === 'ArrowRight' && noMod) cur._btnNext.click();
	});

	window.addEventListener('popstate', e => {
		if (cm.curId !== null) doClose(objs[cm.curId]);
		if (e.state && e.state['name'] === 'nc-viewer' && e.state['id'] !== undefined) {
			doOpen(objs[e.state['id']]);
		}
	});
	window.addEventListener('hashchange', () => checkHash(cm, location.hash, objs));
	checkHash(cm, location.hash, objs);
}

function checkHash(cm, hash, objs) {
	if (location.hash.indexOf('#' + cm.hashPrefix) !== 0) return;
	const ih = hash.replace('#' + cm.hashPrefix, '');
	if (!ih) return;
	for (let i = 0; i < objs.length; i += 1) {
		if (objs[i]._hash === ih) {
			if (cm.curId !== null && cm.curId !== i) doClose(objs[cm.curId]);
			if (cm.curId === null || cm.curId !== i) doOpen(objs[i]);
			break;
		}
	}
}


// -----------------------------------------------------------------------------


let prevInstance = null;
let instanceCount = 0;


function createViewer(cm, a) {
	const inst = {};
	inst._id = instanceCount;
	inst._cm = cm;
	inst._src = a.href;
	inst._hash = calcHash(inst._src);

	a.addEventListener('click', e => _onOpen(inst, e, inst._hash));
	enableClass(true, a, inst._cm.styleOpener);

	inst._frm = document.createElement('div');
	enableClass(true, inst._frm, inst._cm.styleRoot);
	inst._frm.addEventListener('click', e => _onClose(e));

	inst._img = document.createElement('img');
	inst._img.addEventListener('click', e => e.stopPropagation());
	inst._frm.appendChild(inst._img);

	const btn = document.createElement('button');
	enableClass(true, btn, inst._cm.styleCloser);
	inst._frm.appendChild(btn);

	inst._btnPrev = document.createElement('button');
	inst._btnNext = document.createElement('button');
	enableClass(true, inst._btnPrev, inst._cm.stylePrev);
	enableClass(true, inst._btnNext, inst._cm.styleNext);
	inst._frm.appendChild(inst._btnPrev);
	inst._frm.appendChild(inst._btnNext);

	if (a.parentNode.tagName === 'FIGURE') {
		const fcs = a.parentNode.getElementsByTagName('figcaption');
		if (0 < fcs.length) {
			const cap = document.createElement('div');
			cap.innerHTML = '<span>' + fcs[0].innerHTML + '</span>';
			enableClass(true, cap, inst._cm.styleCaption);
			inst._frm.appendChild(cap);
		}
		enableClass(true, a.parentNode, inst._cm.styleOpenerWrapper);
	}
	document.body.appendChild(inst._frm);

	_enableMouseGesture(inst, inst._frm);
	_enableTouchGesture(inst, inst._frm);
	_setAdjacentInstance(inst, prevInstance);

	prevInstance = inst;
	instanceCount += 1;
	return inst;
}


// -----------------------------------------------------------------------------


function setInitialSize(inst) {  // Called also when 'onResize'
	inst._scale = 1;

	const winAs = inst._frm.offsetWidth / inst._frm.offsetHeight;
	const imgAs = inst._img.offsetWidth / inst._img.offsetHeight;
	inst._isLandscape = (winAs < imgAs);

	setSize(inst._img.style);
	function setSize(s) {
		s.minWidth  = '';
		s.minHeight = '';
		if (inst._isLandscape) {
			s.width  = '100%';
			s.height = 'auto';
		} else {
			s.width    = 'auto';
			s.height   = '100%';
			s.maxWidth = 'none';
		}
	}
	inst._baseSize = inst._isLandscape ? inst._frm.clientWidth : inst._frm.clientHeight;
	_doCenteringImage(inst._frm, inst._img);
}

function doOpen(inst, instantly = false) {
	enableClass(true, inst._frm, inst._cm.styleOpen);
	const img = inst._img;
	if (!img.src) {
		img.style.opacity = '0';
		img.src = inst._src;
		img.addEventListener('load', () => {
			setInitialSize(inst);
			enableClass(true, inst._frm, inst._cm.styleLoaded);
			setTimeout(() => { img.style.opacity = '1'; }, 0);
		});
	}
	if (instantly) {
		setInitialSize(inst);
		enableClass(true, inst._frm, inst._cm.styleInstantly);
		enableClass(true, inst._frm, inst._cm.styleVisible);
		setTimeout(() => { enableClass(false, inst._frm, inst._cm.styleInstantly); }, 20);
	} else {
		setTimeout(() => {
			setInitialSize(inst);
			enableClass(true, inst._frm, inst._cm.styleVisible);
		}, 0);
	}
	inst._cm.curId = inst._id;
}

function doClose(inst, instantly = false) {
	if (instantly) {
		enableClass(true, inst._frm, inst._cm.styleInstantly);
		enableClass(false, inst._frm, inst._cm.styleVisible);
		setTimeout(() => { enableClass(false, inst._frm, inst._cm.styleInstantly); }, 20);
	} else {
		enableClass(false, inst._frm, inst._cm.styleVisible);
	}
	setTimeout(() => { enableClass(false, inst._frm, inst._cm.styleOpen); }, 200);
	inst._cm.curId = null;
}


// -----------------------------------------------------------------------------


function _setAdjacentInstance(inst, prev) {
	inst._btnNext.style.display = 'none';
	if (prev) {
		inst._btnPrev.addEventListener('click', (e) => {
			e.stopPropagation();
			doClose(inst, true);
			doOpen(prev, true);
		});
		_setNextInstance(prev, inst);
	} else {
		inst._btnPrev.style.display = 'none';
	}
}

function _setNextInstance(inst, next) {
	inst._btnNext.addEventListener('click', (e) => {
		e.stopPropagation();
		doClose(inst, true);
		doOpen(next, true);
	});
	inst._btnNext.style.display = null;
}

function _onOpen(inst, e, hash) {
	e.preventDefault();
	doOpen(inst);

	if (location.hash) {
		const newUrl = location.href.substr(0, location.href.indexOf('#'));
		history.replaceState(null, '', newUrl);
	}
	const url = '#' + inst._cm.hashPrefix + hash;
	history.pushState({ name: 'nc-viewer', id: inst._id }, null, url);
}

function _onClose(e) {
	e.preventDefault();
	history.back();
}

function _setScaledSize(inst, scale) {
	inst._scale = Math.max(1, Math.min(inst._cm.maxZoomRate, scale));
	const size = (inst._baseSize * inst._scale) + 'px';
	if (inst._isLandscape) {
		inst._img.style.minWidth = size;
	} else {
		inst._img.style.minHeight = size;
	}
	_doCenteringImage(inst._frm, inst._img);
}

function _doCenteringImage(frame, image) {
	const imgW = image.offsetWidth, imgH = image.offsetHeight;
	const frmW = frame.clientWidth, frmH = frame.clientHeight;
	const s = image.style;
	s.left = (imgW < frmW) ? (((frmW - imgW) / 2) + 'px') : 0;
	s.top  = (imgH < frmH) ? (((frmH - imgH) / 2) + 'px') : 0;
}

function _enableMouseGesture(inst, frame) {
	let xS = 0, yS = 0;
	let isMoving = false;

	frame.addEventListener('mousedown', (e) => {
		if (e.button) return;  // when button is not left
		e.preventDefault();
		[xS, yS] = getCursorPoint(e);
		isMoving = true;
	});
	frame.addEventListener('mousemove', (e) => {
		if (!isMoving) return;
		e.stopPropagation();
		e.preventDefault();

		const [cx, cy] = getCursorPoint(e);
		frame.scrollLeft += xS - cx;
		frame.scrollTop += yS - cy;
		xS = cx;
		yS = cy;
	});
	frame.addEventListener('mousedrag', (e) => {
		if (!isMoving) return;
		e.stopPropagation();
		e.preventDefault();
	});
	frame.addEventListener('mouseup', () => { isMoving = false; });

	frame.addEventListener('wheel', (e) => {
		e.stopPropagation();
		e.preventDefault();

		const [cx, cy] = getCursorPoint(e);
		const imgCx = (cx + frame.scrollLeft) / inst._scale;
		const imgCy = (cy + frame.scrollTop)  / inst._scale;

		const s = 0 > e.deltaY ? 1.1 : 0.9;
		_setScaledSize(inst, inst._scale * s);

		frame.scrollLeft = imgCx * inst._scale - cx;
		frame.scrollTop  = imgCy * inst._scale - cy;
	}, true);
}

function _enableTouchGesture(inst, frame) {
	let ix = 0, iy = 0;
	let lastTouchCount = 0;
	let baseDist = 0;

	preventWindowTouchMove(frame);  // for Android

	frame.addEventListener('touchstart', (e) => {
		baseDist = 0;
		updatePoint(e.touches);
	});
	frame.addEventListener('touchmove', (e) => {
		e.preventDefault();
		e.stopPropagation();

		const ts = e.touches;
		if (lastTouchCount !== ts.length) updatePoint(ts);
		const [cx, cy] = getTouchPoint(ts);

		if (2 <= ts.length) {
			const dist = touchDistance(ts);
			if (baseDist) {
				const s = dist / (baseDist * inst._scale);
				if (s && s !== Infinity) {
					_setScaledSize(inst, inst._scale * s);
				}
				frame.scrollLeft = ix * inst._scale - cx;
				frame.scrollTop  = iy * inst._scale - cy;
			}
			baseDist = dist / inst._scale;
		} else {
			frame.scrollLeft = ix * inst._scale - cx;
			frame.scrollTop  = iy * inst._scale - cy;
		}
	}, { passive: false });

	function touchPointToImagePoint(x, y) {
		const fsx = frame.scrollLeft;
		const fsy = frame.scrollTop;
		const ix = (x + fsx) / inst._scale;
		const iy = (y + fsy) / inst._scale;
		return [ix, iy];
	}

	function updatePoint(ts) {
		lastTouchCount = ts.length;
		[ix, iy] = touchPointToImagePoint(...getTouchPoint(ts));
	}
}
