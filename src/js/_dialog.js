/**
 *
 * Dialog
 *
 * @author Takuto Yanagida
 * @version 2022-08-17
 *
 */


function initialize(fs, opts = {}) {
	if (fs.length === 0) return;

	opts = Object.assign({
		styleRoot   : ':ncViewer',
		styleCloser : ':ncViewerCloser',
		stylePrev   : ':ncViewerPrev',
		styleNext   : ':ncViewerNext',
		styleCaption: ':ncViewerCaption',

		styleOpen     : ':ncOpen',
		styleVisible  : ':ncVisible',
		styleInstantly: ':ncInstantly',

		hashPrefix: 'viewer:',
	}, opts);

	const is = new Map();
	let prev = null;
	for (const f of fs) {
		const inst = createViewer(opts, f.id, f.frameInst, f.frame, f.caption, prev);
		f.opener.addEventListener('click', e => _onOpen(inst, e));
		is.set(f.id, inst);
		prev = inst;
	}
	assignEventHandler(is);
	processHash(is, opts['hashPrefix']);
}

function assignEventHandler(is) {
	onResize(() => {
		for (const inst of is.values()) inst.fi.doResize();
		setTimeout(() => {
			for (const inst of is.values()) inst.fi.doResize();
		}, 200);
	});
	window.addEventListener('keydown', e => {
		if (currentId !== null && !e.altKey && !e.ctrlKey && !e.shiftKey) {
			const cur = is.get(currentId);
			if (e.key === 'Escape') cur.dlg.click();
			else if (e.key === 'ArrowLeft') cur.btnPrev.click();
			else if (e.key === 'ArrowRight') cur.btnNext.click();
		}
	});
}

function processHash(is, hashPrefix) {
	window.addEventListener('popstate', e => {
		if (currentId !== null && is.has(currentId)) {
			doClose(is.get(currentId));
		}
		if (e.state && e.state['name'] === 'nc-viewer' && e.state['id'] !== undefined && is.has(e.state['id'])) {
			doOpen(is.get(e.state['id']));
		}
	});
	window.addEventListener('hashchange', () => checkHash(is, hashPrefix, location.hash));
	checkHash(is, hashPrefix, location.hash);
}

function checkHash(is, hashPrefix, hash) {
	if (location.hash.indexOf('#' + hashPrefix) !== 0) return;
	const h = hash.replace('#' + hashPrefix, '');
	if (!h) return;
	for (const [id, inst] of is) {
		if (id === h) {
			if (currentId !== null && currentId !== id) doClose(is.get(currentId));
			if (currentId === null || currentId !== id) doOpen(inst);
			break;
		}
	}
}


// -----------------------------------------------------------------------------


let currentId = null;

function createViewer(opts, id, frameInst, frame, caption, prevInstance = null) {
	const inst = {};
	inst.opts = opts;
	inst.fi   = frameInst;
	inst.id   = id;

	inst.dlg = document.createElement('div');
	setClass(inst.dlg, opts.styleRoot);
	inst.dlg.addEventListener('click', e => _onClose(e));
	inst.dlg.appendChild(frame);

	const btn = document.createElement('button');
	setClass(btn, opts.styleCloser);
	inst.dlg.appendChild(btn);

	inst.btnPrev = document.createElement('button');
	inst.btnNext = document.createElement('button');
	setClass(inst.btnPrev, opts.stylePrev);
	setClass(inst.btnNext, opts.styleNext);
	inst.dlg.appendChild(inst.btnPrev);
	inst.dlg.appendChild(inst.btnNext);

	if (caption) {
		const divCap = document.createElement('div');
		divCap.innerHTML = `<span>${caption}</span>`;
		setClass(divCap, opts.styleCaption);
		inst.dlg.appendChild(divCap);
	}
	document.body.appendChild(inst.dlg);

	_setAdjacentInstance(inst, prevInstance);
	prevInstance = inst;
	return inst;
}


// -----------------------------------------------------------------------------


function doOpen(inst, instantly = false) {
	setClass(inst.dlg, inst.opts.styleOpen);
	inst.fi.doOpen();

	if (instantly) {
		inst.fi.doResize();
		setClass(inst.dlg, inst.opts.styleInstantly);
		setClass(inst.dlg, inst.opts.styleVisible);
		setTimeout(() => { setClass(inst.dlg, inst.opts.styleInstantly, false); }, 20);

		const url = '#' + inst.opts.hashPrefix + inst.id;
		history.replaceState(null, '', url);
	} else {
		setTimeout(() => {
			inst.fi.doResize();
			setClass(inst.dlg, inst.opts.styleVisible);
		}, 0);
	}
	currentId = inst.id;

	const sty = getComputedStyle(document.documentElement);
	if (sty.marginTop) {
		inst.dlg.style.top = sty.marginTop;
	}
}

function doClose(inst, instantly = false) {
	inst.fi.doClose();

	if (instantly) {
		setClass(inst.dlg, inst.opts.styleInstantly);
		setClass(inst.dlg, inst.opts.styleVisible, false);
		setTimeout(() => { setClass(inst.dlg, inst.opts.styleInstantly, false); }, 20);
	} else {
		setClass(inst.dlg, inst.opts.styleVisible, false);
	}
	setTimeout(() => { setClass(inst.dlg, inst.opts.styleOpen, false); }, 200);
	currentId = null;
}


// -----------------------------------------------------------------------------


function _setAdjacentInstance(inst, prev) {
	inst.btnNext.style.display = 'none';
	if (prev) {
		inst.btnPrev.addEventListener('click', e => {
			e.stopPropagation();
			doClose(inst, true);
			doOpen(prev, true);
		});
		_setNextInstance(prev, inst);
	} else {
		inst.btnPrev.style.display = 'none';
	}
}

function _setNextInstance(inst, next) {
	inst.btnNext.addEventListener('click', e => {
		e.stopPropagation();
		doClose(inst, true);
		doOpen(next, true);
	});
	inst.btnNext.style.display = null;
}

function _onOpen(inst, e) {
	e.preventDefault();
	doOpen(inst);

	if (location.hash) {
		const newUrl = location.href.substring(0, location.href.indexOf('#'));
		history.replaceState(null, '', newUrl);
	}
	const url = '#' + inst.opts.hashPrefix + inst.id;
	history.pushState({ name: 'nc-viewer', id: inst.id }, null, url);
}

function _onClose(e) {
	e.preventDefault();
	history.back();
}
