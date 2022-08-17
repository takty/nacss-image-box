/**
 *
 * Iframe Viewer
 *
 * @author Takuto Yanagida
 * @version 2022-08-17
 *
 */


function apply(os, ifms, opts = {}) {
	if (os.length === 0) return;

	opts = Object.assign({
		styleOpener       : ':ncViewerOpener',
		styleOpenerWrapper: ':ncViewerOpenerWrapper',
	}, opts);

	const fs = os.map((o, i) => {
		const id = calcHashSet(ifms[i].src);
		const [frameInst, frame] = createIframeFrame(opts, ifms[i]);
		assignIframeOpenerStyle(o, opts['styleOpener']);

		return { opener: o, id, frameInst, frame, caption: null };
	});
	initialize(fs, opts);
}


// -----------------------------------------------------------------------------


function createIframeFrame(opts, ifm) {
	opts = Object.assign({
		styleIframeFrame: ':ncFrameIframe',
		styleLoaded     : ':ncLoaded',
	}, opts);

	const src = filterSource(ifm.src);

	ifm.removeAttribute('src');
	ifm.setAttribute('data-nc-lazy', '');
	if (!ifm.style.aspectRatio) {
		const [w, h] = extractIframeSize(ifm);
		if (w && h) {
			ifm.style.aspectRatio = `${w} / ${h}`;
		}
	}

	const inst = {
		opts, src, ifm,

		scale    : 1,
		realScale: 1,
		baseSize : null,
		isLs     : false,
		margin   : 0,

		frm: null,
	};

	inst.frm = document.createElement('div');
	setClass(inst.frm, inst.opts.styleIframeFrame);

	inst.ifm.addEventListener('click', e => e.stopPropagation());
	inst.frm.appendChild(inst.ifm);

	inst['doResize'] = () => {};
	inst['doOpen']   = () => setSource(inst);
	inst['doClose']  = () => pause(inst);
	return [inst, inst.frm];
}

function assignIframeOpenerStyle(o, styleOpener) {
	setClass(o, styleOpener);
}


// -----------------------------------------------------------------------------


function setSource(inst) {
	const ifm = inst.ifm;
	if (ifm.hasAttribute('data-nc-lazy')) {
		ifm.removeAttribute('data-nc-lazy');
		ifm.style.opacity = '0';
		ifm.addEventListener('load', () => {
			setClass(inst.frm, inst.opts.styleLoaded);
			setTimeout(() => { ifm.style.opacity = '1'; }, 0);
		});
		ifm.contentDocument.location.replace(inst.src);
	}
}

function pause(inst) {
	if (inst.src.startsWith('https://www.youtube.com')) {
		inst.ifm.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
	}
}


// -----------------------------------------------------------------------------


function filterSource(src) {
	if (src.startsWith('https://www.youtube.com')) {
		const url = new URL(src);
		const ps  = new URLSearchParams(url.search);
		ps.append('enablejsapi', 1);
		url.search = ps;
		src = url.toString();
	}
	return src;
}

function extractIframeSize(f) {
	let w = parseInt(f.width);
	let h = parseInt(f.height);
	if (w && h) return [w, h];

	const sW = f.style.width;
	const sH = f.style.height;
	if (sW.indexOf('px') !== sW.length - 2) return [0, 0];
	if (sH.indexOf('px') !== sH.length - 2) return [0, 0];
	w = parseInt(sW);
	h = parseInt(sH);
	if (w && h) return [w, h];
	return [0, 0];
}
