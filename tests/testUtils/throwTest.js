const assert = require('assert');

const _ = require('lodash');

const isPromise = require('./isPromise.js');

module.exports = (testName, execFun, execArgs, errMessage) => {
	if (isPromise(execFun)) {
		it(testName, async () => {
			execFun(...execArgs)

			.then(assert.fail)

			.catch((err) => {
				assert(_.includes(err.message, errMessage));
			});

		});
	} else {
		it(testName, () => {
			try {
				execFun(...execArgs);
			} catch (err) {
				assert(_.includes(err.message, errMessage));
			}
		});
	}
};
