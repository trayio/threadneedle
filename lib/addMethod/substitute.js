var Mustache = require('mustache');
var _        = require('lodash');

module.exports = evaluateAndProcess;

function evaluateAndProcess (template, params) {

	if (_.isFunction(template)) return template.call(null, params);

	if (_.isString(template))   return substituteString(template, params);

	if (_.isArray(template))    return substituteArray(template, params);

	if (_.isObject(template))   return substituteObject(template, params);

	return template;

}

function substituteString(template, params) {

	// Smart substitution. If there's a single variable that's been substituted
	// into a field (which is what happens most of the time), then extract the key
	// and return the real value.
	if (template.match(/^({{([^{}]+)}}|{{{([^{}]+)}}})$/g)) {
		var key = _.trim(template.match(/(?!{)([^{}]+)(?=})/g)[0]);
		var value = _.get(params, key, '');
		if (value !== '') {
			return value;
		}
	}

	if (template.match(/{{(#[^{}]+)}}|{{{#([^{}]+)}}}/g)) {
		//Substitute hash paramters first, then continue with standard mustaching
		template = substituteHashParameters(template, params);
	}

	// If the above isn't the case, then template it with Mustache.
	var str =  Mustache.render(template, params);

	return ( str === '' ? undefined : str );

}

//Mustache.render only the hash paramters seperately
function substituteHashParameters (template, params) {

	var pathList = [];

	//Replace unsecape templating
	template = _.replace(template, /({{{#[^{}]+}}})/g, function (match, group) {
		var path = group.replace('}}}', '').replace('{{{#', '');
		pathList.push(path);
		return '##{' + path + '}##';
	});

	//Replace all other templating
	template = _.replace(template, /({{#[^{}]+}})/g, function (match, group) {
		var path = group.replace('}}', '').replace('{{#', '');
		pathList.push(path);
		return '##' + path + '##';
	});

	/*
		Create a substituted params including only hash parameters
		(but without the hash at the start of the key)
	*/
	var hashParams = _.reduce(pathList, function (acc, path) {
		return _.set(acc, path, _.get(params, '#' + path));
	}, {});

	return Mustache.render(template, hashParams, {}, [ '##', '##' ]);

}

function substituteArray(template, params) {
	return _.map(template, function (value) {
		return evaluateAndProcess(value, params);
	});
}

function substituteObject(template, params) {
	//The `accumulator` variable is the output object being built
	return _.reduce(template, function (accumulator, value, key) {
		accumulator[key] = evaluateAndProcess(value, params);
		return accumulator;
	}, {});
}
