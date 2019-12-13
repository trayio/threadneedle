const assert = require('assert');

const _ = require('lodash');

module.exports = (testName, execFun, execArgs, errMessage) => {
	if (_.isFunction(execFun.then)) {
		it(testName, async () => {

			await execFun(...execArgs)

			.then(assert.fail)

			.catch((err) => {
				assert(_.includes(err.message, errMessage));
			})

			.finally(() => {
				console.log('here');
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
