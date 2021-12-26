/**
 *
 * Functions for Hash
 *
 * @author Takuto Yanagida
 * @version 2021-10-15
 *
 */


function calcHash(str, asHex = true) {
	let h = 0x811c9dc5;
	for (let i = 0; i < str.length; i += 1) {
		h ^= str.charCodeAt(i);
		h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
	}
	if (asHex) return ('0000000' + (h >>> 0).toString(16)).substr(-8);
	return h >>> 0;
}
