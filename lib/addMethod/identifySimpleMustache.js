/*
	Check if the mustaching being used is simple for purposes of smart
	substitution.
	Simple mustache is defined by the fact the string only contains a single
	mustache and is the only thing present in the string.
	E.g:
		`url: '{{url}}'` is simple.
		`url: test.com/{{endpoint}}` is not simple, since `{{endpint}}` is not on
			its own. This also means any extra whitespace prefixing or suffixing
			the mustache is not simple.
*/
module.exports = function (template) {
	return template.match(/^({{([^{}]+)}}|{{{([^{}]+)}}})$/g);
};
