/**
 *
 * Image Viewer
 *
 * @author Takuto Yanagida
 * @version 2021-12-26
 *
 */


function apply(as, opts = {}) {
	if (as.length === 0) return;

	opts = Object.assign({
		styleOpener       : ':ncViewerOpener',
		styleOpenerWrapper: ':ncViewerOpenerWrapper',
	}, opts);

	const fs = as.map(a => {
		const hash = calcHash(a.href);
		const [frameInst, frame] = createImageFrame(opts, a.href);
		const caption = extractImageCaption(a);
		assignImageOpenerStyle(a, opts['styleOpener'], opts['styleOpenerWrapper']);

		return { opener: a, hash, frameInst, frame, caption };
	});
	initialize(fs, opts);
}


// -----------------------------------------------------------------------------


function createImageFrame(opts, src) {
	opts = Object.assign({
		styleImageFrame: ':ncFrameImage',
		styleLoaded    : ':ncLoaded',
		maxZoomRate    : 10,
	}, opts);

	const inst = {
		opts, src,

		scale    : 1,
		realScale: 1,
		baseSize : null,
		isLs     : false,
		margin   : 0,

		frm: null,
		img: null,
	};

	inst.frm = document.createElement('div');
	setClass(inst.frm, inst.opts.styleImageFrame);

	inst.img = document.createElement('img');
	inst.img.addEventListener('click', e => e.stopPropagation());
	inst.frm.appendChild(inst.img);

	_enableMouseGesture(inst, inst.frm);
	_enableTouchGesture(inst, inst.frm);

	inst['doResize'] = () => setSize(inst);
	inst['doOpen']   = () => setSource(inst);
	inst['doClose']  = () => {};
	return [inst, inst.frm];
}

function extractImageCaption(a) {
	if (a.parentNode.tagName === 'FIGURE') {
		const fcs = a.parentNode.getElementsByTagName('figcaption');
		if (0 < fcs.length) {
			return fcs[0].innerHTML;
		}
	}
	return null;
}

function assignImageOpenerStyle(a, styleOpener, styleOpenerWrapper) {
	setClass(a, styleOpener);
	if (a.parentNode.tagName === 'FIGURE') {
		setClass(a.parentNode, styleOpenerWrapper);
	}
}


// -----------------------------------------------------------------------------


function setSize(inst) {
	const winAs = inst.frm.offsetWidth / inst.frm.offsetHeight;
	const imgAs = inst.img.offsetWidth / inst.img.offsetHeight;
	inst.isLs = (winAs < imgAs);

	const cs = getComputedStyle(inst.img);
	inst.margin = parseInt(cs.outlineWidth) * 2;

	const s = inst.img.style;
	s.minWidth  = '';
	s.minHeight = '';
	if (inst.isLs) {
		s.width  = `calc(100% - ${inst.margin}px)`;
		s.height = 'auto';
	} else {
		s.width    = 'auto';
		s.height   = `calc(100% - ${inst.margin}px)`;
		s.maxWidth = 'none';
	}

	inst.baseSize = inst.isLs ? inst.frm.clientWidth  : inst.frm.clientHeight;
	const nbs     = inst.isLs ? inst.img.naturalWidth : inst.img.naturalHeight;

	inst.realScale = nbs / inst.baseSize;
	inst.scale     = 1;
	_doCenteringImage(inst.frm, inst.img);
}

function setSource(inst) {
	const img = inst.img;
	if (!img.src) {
		img.style.opacity = '0';
		img.src = inst.src;
		img.addEventListener('load', () => {
			setSize(inst);
			setClass(inst.frm, inst.opts.styleLoaded);
			setTimeout(() => { img.style.opacity = '1'; }, 0);
		});
	}
}


// -----------------------------------------------------------------------------


function _setScaledSize(inst, scale) {
	inst.scale = Math.max(1, Math.min(inst.opts.maxZoomRate, scale));

	const size = (inst.baseSize * inst.scale - inst.margin) + 'px';
	if (inst.isLs) {
		inst.img.style.minWidth = size;
	} else {
		inst.img.style.minHeight = size;
	}
	_doCenteringImage(inst.frm, inst.img);
}

function _doCenteringImage(frm, img) {
	const imgW = img.offsetWidth, imgH = img.offsetHeight;
	const frmW = frm.clientWidth, frmH = frm.clientHeight;
	const s = img.style;
	s.left = (imgW < frmW) ? (((frmW - imgW) / 2) + 'px') : 0;
	s.top  = (imgH < frmH) ? (((frmH - imgH) / 2) + 'px') : 0;
}

function _enableMouseGesture(inst, frm) {
	let xS = 0, yS = 0;
	let isMoving = false;

	frm.addEventListener('mousedown', e => {
		if (e.button) return;  // when button is not left
		e.preventDefault();
		[xS, yS] = getCursorPoint(e);
		isMoving = true;
	});
	frm.addEventListener('mousemove', e => {
		if (!isMoving) return;
		e.stopPropagation();
		e.preventDefault();

		const [cx, cy] = getCursorPoint(e);
		frm.scrollLeft += xS - cx;
		frm.scrollTop  += yS - cy;
		xS = cx;
		yS = cy;
	});
	frm.addEventListener('mousedrag', e => {
		if (!isMoving) return;
		e.stopPropagation();
		e.preventDefault();
	});
	frm.addEventListener('mouseup', () => { isMoving = false; });

	frm.addEventListener('wheel', e => {
		const s = 0 > e.deltaY ? 1.1 : 0.9;
		zoomListener(e, inst.scale * s);
	}, true);
	frm.addEventListener('dblclick', e => {
		if (inst.realScale < 1) return;
		zoomListener(e, inst.scale < inst.realScale ? inst.realScale : 1);
	}, true);

	function zoomListener(e, scale) {
		e.stopPropagation();
		e.preventDefault();

		const [cx, cy] = getCursorPoint(e);
		const ix = (cx + frm.scrollLeft) / inst.scale;
		const iy = (cy + frm.scrollTop)  / inst.scale;

		_setScaledSize(inst, scale);

		frm.scrollLeft = ix * inst.scale - cx;
		frm.scrollTop  = iy * inst.scale - cy;
	}
}

function _enableTouchGesture(inst, frm) {
	let ix = 0, iy = 0;
	let lastTouchCount = 0;
	let baseDist = 0;

	preventWindowTouchMove(frm);  // for Android

	frm.addEventListener('touchstart', e => {
		baseDist = 0;
		updatePoint(e.touches);
	});
	frm.addEventListener('touchmove', e => {
		e.preventDefault();
		e.stopPropagation();

		const ts = e.touches;
		if (lastTouchCount !== ts.length) {
			updatePoint(ts);
		}
		const [cx, cy] = getTouchPoint(ts);

		if (2 <= ts.length) {
			const dist = touchDistance(ts);
			if (baseDist) {
				const s = dist / (baseDist * inst.scale);
				if (s && s !== Infinity) {
					_setScaledSize(inst, inst.scale * s);
				}
				frm.scrollLeft = ix * inst.scale - cx;
				frm.scrollTop  = iy * inst.scale - cy;
			}
			baseDist = dist / inst.scale;
		} else {
			frm.scrollLeft = ix * inst.scale - cx;
			frm.scrollTop  = iy * inst.scale - cy;
		}
	}, { passive: false });

	function touchPointToImagePoint(x, y) {
		const fsx = frm.scrollLeft;
		const fsy = frm.scrollTop;
		const ix = (x + fsx) / inst.scale;
		const iy = (y + fsy) / inst.scale;
		return [ix, iy];
	}

	function updatePoint(ts) {
		lastTouchCount = ts.length;
		[ix, iy] = touchPointToImagePoint(...getTouchPoint(ts));
	}
}
