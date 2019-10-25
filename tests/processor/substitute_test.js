const assert	= require('assert');

const _	= require('lodash');

const substitute	= require('../../lib/processor/substitute');
// const throwtest = require('../testutils/throwtest');

//TODO
describe('substitute', () => {

	let testData = {
		id: 'abc',
		user_id: '123',
		string: 'Hello World',
		number: 123,
		object: {
			hello: 'hello',
			world: 'world'
		},
		array: [ 'a', 'b', 'c' ],
		doubleArray: [ ['a'], 'b', [['c']] ],
		true: true,
		false: false,
		null: null,
		time: new Date(2016, 1, 5)
	};

	it('substitute is a function', () => {
		assert(_.isFunction(substitute));
	});

	it('should substitute into string templates', () => {
		let url = 'https://test.com/{{id}}/user/{{user_id}}';
		let output = substitute(
			url,
			testData
		);
		assert.strictEqual(output, `https://test.com/${testData.id}/user/${testData.user_id}`);
	});

	it('should substitute for triple brackets', function () {
		let output = substitute(
			{
				id: '{{{id}}}',
			},
			testData
		);
		assert.equal(output.id, `${testData.id}`);
	});

	// throwtest(
	// 	'should not substitute for when brackets numbers are not paired',
	// 	substitute,
	// 	[
	// 		{
	// 			id: '{{{id}}',
	// 		},
	// 		testData
	// 	],
	// 	'Unclosed tag at 7'
	// );

	it('should substitute into object templates', () => {
		let output = substitute(
			{
				id: '{{id}}',
				user_id: '{{user_id}}',
				name: 'The name is {{string}}, created at {{time}}'
			},
			testData
		);

		assert.equal(output.id, `${testData.id}`);
		assert.equal(output.user_id, `${testData.user_id}`);
		assert.strictEqual(output.name, `The name is ${testData.string}, created at ${testData.time}`);
	});

	it('should substitute fancy data like objects, arrays, and dates', () => {
		let output = substitute(
			{
				object: '{{object}}',
				array: '{{array}}',
				time: '{{time}}'
			},
			testData
		);

		assert.deepEqual(output, _.pick(testData, [ 'object', 'array', 'time' ]));
	});

	it('should substitute into nested object templates', () => {
		let output = substitute(
			{
				nested: {
					object: '{{object}}',
					array: '{{array}}',
					time: '{{time}}'
				}
			},
			testData
		);
		assert.deepEqual(output, { nested: _.pick(testData, [ 'object', 'array', 'time' ]) });
	});

	it('should substitute into array templates', () => {
		let output = substitute(
			[ '{{id}}', '{{string}}' ],
			testData
		);
		assert.deepEqual(output, [ `${testData.id}`, `${testData.string}` ]);
	});

	it('should substitute into array nested templates', () => {
		let output = substitute(
			[{ id: '{{id}}', string: '{{string}}' }],
			testData
		);
		assert.deepEqual(output, [{ id: `${testData.id}`, string: `${testData.string}` }]);
	});

	it('non-templates should remain as they are', () => {
		let output = substitute(
			{
				id: '{{id}}',
				string: '{{string}}',
				xyz: [ 'Hello', 'World' ]
			},
			testData
		);
		assert.deepEqual(output, { id: `${testData.id}`, string: `${testData.string}`, xyz: [ 'Hello', 'World' ] });
	});

	it('should substitute into function templates', () => {
		let output = substitute(
			function ({ id, user_id }) { return `https://test.com/${id}/user/${user_id}`; },
			testData
		);
		assert.strictEqual(output, `https://test.com/${testData.id}/user/${testData.user_id}`);
	});

	it('should substitute into function templates within nested objects', () => {
		let output = substitute(
			{
				id: function (params) {
					return String(params.id);
				}
			},
			testData
		);
		assert.strictEqual(output.id, testData.id);
	});

	it('should substitute dot notation templates', () => {
		let output = substitute(
			{
				dot: '{{object.hello}}'
			},
			testData
		);
		assert.strictEqual(output.dot, testData.object.hello);
	});

	it('should preserve the parameter types on single variable substitutions', () => {
		let output = substitute(
			{
				age: '{{number}}',
				isReincarnated: '{{true}}',
				isClever: '{{null}}'
			},
			testData
		);

		assert.deepEqual(
			output,
			{
				age: testData.number,
				isReincarnated: testData.true,
				isClever: testData.null
			}
		);
	});

	it('should not typecast keys inputted not as string params', () => {
		let output = substitute(
			{
				age: '{{age}}',
				isReincarnated: '{{reincarnated}}',
				idea: '{{idea}}',
				isClever: '{{clever}}'
			},
			{
				age: '25',
				reincarnated: 'true',
				idea: 'null',
				clever: 'false'
			}
		);

		assert.deepEqual(
			output,
			{
				age: '25',
				isReincarnated: 'true',
				idea: 'null',
				isClever: 'false'
			}
		);
	});

	it('should not set variables which are undefined', () => {
		let output = substitute(
			{
				name: '{{string}}',
				age: '{{age}}',
				double: '{{first}}{{second}}'
			},
			testData
		);
		assert.strictEqual(output.name, `${testData.string}`);
		assert(_.isUndefined(output.age));
		assert(_.isUndefined(output.double));
	});

	it('should not set variables which are blank strings', () => {
		let output = substitute(
			{
				name: '{{name}}',
				age: '{{age}}'
			},
			{
				name: '',
				age: 26
			}
		);
		assert(_.isUndefined(output.name));
		assert.strictEqual(output.age, 26);
	});

	it('should return target if not possible to substitute', () => {
		let output = substitute(undefined, {});
		assert(_.isUndefined(output));
	});

	// throwtest(
	// 	'should surface error if function errors',
	// 	(params) => { throw new Error('Invalid params.'); },
	// 	[testData],
	// 	'Invalid params.'
	// );

});

//Old
// describe('#substitute', function () {
//
// 	it('should substitute into string templates', function () {
// 		var url = 'https://{{dc}}.api.mailchimp.com/2.0/lists/list?apikey={{apiKey}}';
// 		var output = substitute(url, {
// 			dc: 'us5',
// 			apiKey: '123'
// 		});
// 		assert.strictEqual(output, 'https://us5.api.mailchimp.com/2.0/lists/list?apikey=123');
// 	});
//
// 	it('should substitute into string templates with hash variables', function () {
// 		var options = {
// 			headers: {
// 				Authorization: 'Bearer {{#auth.access_token}}'
// 			}
// 		};
// 		var output = substitute(options, {
// 			'#auth': {
// 				access_token: '1234567'
// 			}
// 		});
// 		assert.deepEqual(output, {
// 			headers: {
// 				Authorization: 'Bearer 1234567'
// 			}
// 		});
// 		var templateString = 'Basic {{{#auth.username}}}{{{#auth.password}}}{{signature}}{{#auth.region}}';
// 		var output2 = substitute(templateString, {
// 			'#auth': {
// 				username: 'abcdefg',
// 				password: '1234567',
// 				region: 'us'
// 			},
// 			signature: 'something'
// 		});
// 		assert.strictEqual(
// 			output2,
// 			'Basic abcdefg1234567somethingus'
// 		);
// 	});
//
// 	it('should substitute into object templates', function () {
// 		var data = {
// 			apikey: '{{apiKey}}',
// 			id: '{{listId}}',
// 			name: 'The name is {{name}}, created at {{created}}'
// 		};
// 		var output = substitute(data, {
// 			apiKey: '123',
// 			listId: '6543',
// 			name: 'Chris',
// 			created: new Date(2016, 1, 5)
// 		});
//
// 		assert.equal(output.apikey, '123');
// 		assert.equal(output.id, '6543');
// 		assert.equal(
// 			output.name.indexOf('The name is Chris, created at Fri Feb 05 2016 00:00:00'),
// 			0
// 		);
// 	});
//
// 	it('should substitute for triple brackets', function () {
// 		var data = {
// 			id: '{{{listId}}}',
// 		};
// 		var output = substitute(data, {
// 			listId: '6543'
// 		});
//
// 		assert.equal(output.id, '6543');
// 	});
//
// 	it('should not substitute for when brackets numbers are not paired', function () {
// 		var data = {
// 			id: '{{{listId}}',
// 		};
//
// 		assert.throws(
// 			function () {
// 				output = substitute(data, {
// 					listId: '6543'
// 				});
// 			},
// 			function (err) {
// 				return _.isError(err);
// 			}
// 		);
// 	});
//
// 	it('should substitute fancy data like objects, arrays, and dates', function () {
// 		var data = {
// 			opt_fields: '{{fields}}',
// 			newConfig: '{{config}}'
// 		};
//
// 		var output = substitute(data, {
// 			fields: [ 'id', 'is_organization' ],
// 			config: {
// 				name: 'Chris',
// 				age: 25
// 			}
// 		});
// 		assert.deepEqual(output, {
// 			opt_fields: [ 'id', 'is_organization' ],
// 			newConfig: {
// 				name: 'Chris',
// 				age: 25
// 			}
// 		});
// 	});
//
// 	it('should substitute by dot notation via _.get', function () {
// 		var data = {
// 			newConfig: {
// 				name: '{{config.name}}',
// 				age: '{{config.age}}'
// 			}
// 		};
//
// 		var output = substitute(data, {
// 			config: {
// 				name: 'Chris',
// 				age: 25
// 			}
// 		});
// 		assert.deepEqual(output, {
// 			newConfig: {
// 				name: 'Chris',
// 				age: 25
// 			}
// 		});
// 	});
//
// 	it('should substitute into nested object templates', function () {
// 		var data = {
// 			nested: {
// 				apikey: '{{apiKey}}',
// 				id: '{{listId}}',
// 				name: 'The name is {{name}}, created at {{created}}'
// 			}
// 		};
// 		var output = substitute(data, {
// 			apiKey: '123',
// 			listId: '6543',
// 			name: 'Chris',
// 			created: 1
// 		});
// 		assert.deepEqual(output, {
// 			nested: {
// 				apikey: '123',
// 				id: '6543',
// 				name: 'The name is Chris, created at 1'
// 			}
// 		});
// 	});
//
// 	it('should substitute into array templates', function () {
// 		var data = [ '{{name}}', '{{listId}}' ];
// 		var output = substitute(data, {
// 			name: 'Chris',
// 			listId: '123'
// 		});
// 		assert.deepEqual(output, [ 'Chris', '123' ]);
// 	});
//
// 	it('should substitute into array nested templates', function () {
// 		var data = [{ firstName: '{{name}}', list: '{{listId}}' }];
// 		var output = substitute(data, {
// 			name: 'Chris',
// 			listId: '123'
// 		});
// 		assert.deepEqual(output, [{ firstName: 'Chris', list: '123' }]);
// 	});
//
// 	it('non-templates should remain as they are', function () {
// 		var data = { x: '{{x}}', y: ['123'], z: '{{z}}' };
// 		var output = substitute(data, {
// 			x: 'hello',
// 			z: 123
// 		});
// 		assert.deepEqual(output, { x: 'hello', y: ['123'], z: 123 });
// 	});
//
// 	it('should substitute into function templates', function () {
// 		var url = function (params) {
// 			return 'https://'+params.dc+'.api.mailchimp.com/2.0/lists/list?apikey='+params.apiKey;
// 		};
// 		var output = substitute(url, {
// 			dc: 'us5',
// 			apiKey: '123'
// 		});
// 		assert.strictEqual(output, 'https://us5.api.mailchimp.com/2.0/lists/list?apikey=123');
// 	});
//
// 	it('should substitute into function templates within nested objects', function () {
// 		var output = substitute({
// 			id: function (params) {
// 				return String(params.id);
// 			}
// 		}, {
// 			id: 123
// 		});
// 		assert.strictEqual(output.id, '123');
//
// 		var output = substitute({
// 			id: function (params) {
// 				return String(params.id);
// 			}
// 		}, {
// 			id: '123'
// 		});
// 		assert.strictEqual(output.id, '123');
// 	});
//
// 	it('should preserve the parameter types on single variable substitutions', function () {
// 		var output = substitute({
// 			age: '{{age}}',
// 			isReincarnated: '{{reincarnated}}',
// 			isClever: '{{clever}}'
// 		}, {
// 			age: 25,
// 			reincarnated: true,
// 			clever: null
// 		});
//
// 		assert.strictEqual(output.age, 25);
// 		assert.strictEqual(output.isReincarnated, true);
// 		assert.strictEqual(output.isClever, null);
// 	});
//
// 	it('should not typecast keys inputted not as string params', function () {
// 		var output = substitute({
// 			age: '{{age}}',
// 			isReincarnated: '{{reincarnated}}',
// 			idea: '{{idea}}',
// 			isClever: '{{clever}}'
// 		}, {
// 			age: '25',
// 			reincarnated: 'true',
// 			clever: 'false',
// 			idea: 'null'
// 		});
//
// 		assert.strictEqual(output.age, '25');
// 		assert.strictEqual(output.isReincarnated, 'true');
// 		assert.strictEqual(output.isClever, 'false');
// 		assert.strictEqual(output.idea, 'null');
// 	});
//
// 	it('should not set variables which are undefined', function () {
// 		var output = substitute({
// 			name: '{{name}}',
// 			age: '{{age}}',
// 			double: '{{first}}{{second}}'
// 		}, {
// 			name: 'Chris Houghton'
// 		});
//
// 		assert.strictEqual(output.name, 'Chris Houghton');
// 		assert(_.isUndefined(output.age));
// 		assert(_.isUndefined(output.double));
// 	});
//
// 	it('should not set variables which are blank strings', function () {
// 		var output = substitute({
// 			name: '{{name}}',
// 			age: '{{age}}'
// 		}, {
// 			name: '',
// 			age: 26
// 		});
//
// 		assert(_.isUndefined(output.name));
// 		assert.strictEqual(output.age, 26);
// 	});
//
//
// });
