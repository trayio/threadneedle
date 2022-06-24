const _ = require('lodash');

/*	All of the functions were copied from the source code of mout (v0.11.0),
	including the tests. Should be swapped out for lodash or native code later */

const hexChars = '0123456789abcdef'.split('');
function randHex (size) {
	size = size && size > 0 ? size : 6;
	let str = '';
	while (size--) {
		str += _.sample(hexChars);
	}
	return str;
}

function guid () {
	return (
		randHex(8)+'-'+
        randHex(4)+'-'+
        // v4 UUID always contain "4" at this position to specify it was
        // randomly generated
        '4' + randHex(3) +'-'+
        // v4 UUID always contain chars [a,b,8,9] at this position
        _.sample([ 8, 9, 'a', 'b' ]) + randHex(3)+'-'+
        randHex(12)
	);
}

function startsWith (str, prefix) {
	str = _.toString(str);
	prefix = _.toString(prefix);
	
	return str.indexOf(prefix) === 0;
}

function setParam (url, paramName, value) {
	url = url || '';

	let re = new RegExp('(\\?|&)'+ paramName +'=[^&]*' );
	let param = paramName +'='+ encodeURIComponent( value );

	if ( re.test(url) ) {
		return url.replace(re, '$1'+ param);
	} else {
		if (url.indexOf('?') === -1) {
			url += '?';
		}
		if (url.indexOf('=') !== -1) {
			url += '&';
		}
		return url + param;
	}

}

module.exports = {
	randHex,
	guid,
	startsWith,
	setParam,
};
