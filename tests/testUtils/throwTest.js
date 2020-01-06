const assert = require('assert');

const _ = require('lodash');

function isPromise (targetFunction) {
	return targetFunction.constructor.name === 'AsyncFunction' || _.isFunction(targetFunction.then);
}

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
