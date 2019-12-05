const assert = require('assert');

module.exports = (testName, execFun, execArgs, errMessage) => {
	it(testName, () => {
		assert.throws(
			() => { execFun(...execArgs); },
			(err) => {
				return err.message === errMessage;
			}
		);
	});
};
