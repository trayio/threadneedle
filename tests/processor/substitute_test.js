const assert	= require('assert');

const _	= require('lodash');

const substitute	= require('../../lib/processor/substitute');
const throwTest = require('../testUtils/throwTest');

describe('substitute', () => {

	const testData = {
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
		const url = 'https://test.com/{{id}}/user/{{user_id}}';
		const output = substitute(
			url,
			testData
		);
		assert.strictEqual(output, `https://test.com/${testData.id}/user/${testData.user_id}`);
	});

	it('should substitute for triple brackets', function () {
		const output = substitute(
			{
				id: '{{{id}}}',
			},
			testData
		);
		assert.equal(output.id, `${testData.id}`);
	});

	it('should substitute into string templates with hash variables', function () {
		const options = {
			headers: {
				Authorization: 'Bearer {{#auth.access_token}}'
			}
		};
		const output = substitute(options, {
			'#auth': {
				access_token: '1234567'
			}
		});
		assert.deepEqual(output, {
			headers: {
				Authorization: 'Bearer 1234567'
			}
		});
		const templateString = 'Basic {{{#auth.username}}}{{{#auth.password}}}{{signature}}{{#auth.region}}';
		const output2 = substitute(templateString, {
			'#auth': {
				username: 'abcdefg',
				password: '1234567',
				region: 'us'
			},
			signature: 'something'
		});
		assert.strictEqual(
			output2,
			'Basic abcdefg1234567somethingus'
		);
	});

	throwTest(
		'should not substitute for when brackets numbers are not paired',
		substitute,
		[
			{
				id: '{{{id}}',
			},
			testData
		],
		'Unclosed tag at 7'
	);

	it('should substitute into object templates', () => {
		const output = substitute(
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

	it('should substitute by dot notation via _.get', function () {
		const data = {
			newConfig: {
				name: '{{config.name}}',
				age: '{{config.age}}'
			}
		};

		const output = substitute(data, {
			config: {
				name: 'Chris',
				age: 25
			}
		});
		assert.deepEqual(output, {
			newConfig: {
				name: 'Chris',
				age: 25
			}
		});
	});

	it('should substitute dot notation templates', () => {
		const output = substitute(
			{
				dot: '{{object.hello}}'
			},
			testData
		);
		assert.strictEqual(output.dot, testData.object.hello);
	});

	it('should substitute fancy data like objects, arrays, and dates', () => {
		const output = substitute(
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
		const output = substitute(
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
		const output = substitute(
			[ '{{id}}', '{{string}}' ],
			testData
		);
		assert.deepEqual(output, [ `${testData.id}`, `${testData.string}` ]);
	});

	it('should substitute into array nested templates', () => {
		const output = substitute(
			[{ id: '{{id}}', string: '{{string}}' }],
			testData
		);
		assert.deepEqual(output, [{ id: `${testData.id}`, string: `${testData.string}` }]);
	});

	it('non-templates should remain as they are', () => {
		const output = substitute(
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
		const output = substitute(
			function ({ id, user_id }) { return `https://test.com/${id}/user/${user_id}`; },
			testData
		);
		assert.strictEqual(output, `https://test.com/${testData.id}/user/${testData.user_id}`);
	});

	it('should substitute into function templates within nested objects', () => {
		const output = substitute(
			{
				id: function (params) {
					return String(params.id);
				}
			},
			testData
		);
		assert.strictEqual(output.id, testData.id);
	});



	it('should preserve the parameter types on single variable substitutions', () => {
		const output = substitute(
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
		const output = substitute(
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
		const output = substitute(
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
		const output = substitute(
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
		const output = substitute(undefined, {});
		assert(_.isUndefined(output));
	});

	throwTest(
		'should surface error if function errors',
		(params) => { throw new Error('Invalid params.'); },
		[testData],
		'Invalid params.'
	);

});
