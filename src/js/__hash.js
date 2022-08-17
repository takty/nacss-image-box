/**
 *
 * Functions for Hash
 *
 * @author Takuto Yanagida
 * @version 2022-08-17
 *
 */


function calcHash(str, asHex = true) {
	let h = 0x811c9dc5;
	for (let i = 0; i < str.length; i += 1) {
		h ^= str.charCodeAt(i);
		h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
	}
	if (asHex) {
		const hex = '0000000' + (h >>> 0).toString(16);
		return hex.substring(hex.length - 8);
	}
	return h >>> 0;
}

const cache = new Map();

function calcHashSet(str, asHex = true) {
	if (cache.has(str)) {
		const n = cache.get(str);
		cache.set(str, n + 1);
		return calcHash(str + n, asHex);
	} else {
		cache.set(str, 1);
		return calcHash(str, asHex);
	}
}
