const _ = require('lodash');
const Mustache = require('mustache');

function evaluateAndProcess ( target, params = {} ) {

	if (_.isFunction(target)) {
		return target.call(null, params);
	}

	if (_.isString(target)) {
		return substituteString(target, params);
	}

	if (_.isArray(target)) {
		return substituteArray(target, params);
	}

	if (_.isPlainObject(target)) {
		return substituteObject(target, params);
	}

	return target;

}

function substituteString (template, params) {

	/*
	 	Smart substitution. If there's a single variable that's been
		substituted into a field (which is what happens most of the time), then
		extract the key and return the original value provided (i.e. maintining
		data type).
	*/
	if (template.match(/^{{([^{}]+)}}|{{{([^{}]+)}}}$/g)) {
		const key = _.trim(template.match(/(?!{)([^{}]+)(?=})/g)[0]);
		const value = _.get(params, key, '');
		if (value !== '') { return value; }
	}

	/*
		This is needed because Mustache has it's own behaviour for parameters
		starting with #
	*/
	if (template.match(/{{(#[^{}]+)}}|{{{#([^{}]+)}}}/g)) {
		//Substitute hash paramters first, then continue with standard mustaching
		template = substituteHashParameters(template, params);
	}

	// If the above isn't the case, then template it with Mustache - only strings
	return Mustache.render(template, params) || undefined;

}

//Mustache.render only the hash paramters seperately
function substituteHashParameters (template, params) {

	const pathList = [];

	//Replace unsecaped templating
	template = _.replace(template, /({{{#[^{}]+}}})/g, (match, group) => {
		const path = group.replace('}}}', '').replace('{{{#', '');
		pathList.push(path);
		return `##{${path}}##`;
		// return '##{' + path + '}##';
	});

	//Replace all other templating
	template = _.replace(template, /({{#[^{}]+}})/g, (match, group) => {
		const path = group.replace('}}', '').replace('{{#', '');
		pathList.push(path);
		return `##${path}##`;
		// return '##' + path + '##';
	});

	/*
		Create a substituted params including only hash parameters
		(but without the hash at the start of the key)
	*/
	const hashParams = _.reduce(pathList, (acc, path) => {
		return _.set(acc, path, _.get(params, `#${path}`));
	}, {});

	return Mustache.render(template, hashParams, {}, [ '##', '##' ]);

}


function substituteArray (target, params) {
	return _.map(target, (value) => { return evaluateAndProcess(value, params); });
}

function substituteObject (target, params) {
	return _.mapValues(target, (value) => {	return evaluateAndProcess(value, params); });
}

module.exports = evaluateAndProcess;
