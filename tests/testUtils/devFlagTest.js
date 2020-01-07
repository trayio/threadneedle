const isPromise = require('./isPromise.js');

const DEV_MODE = process.env.NODE_ENV === 'development';

const handleDevFlagTest = (
	DEV_MODE ?
	it :
	(testMessage, testFunction) => {
		if (testFunction.length) { //Check whether the function expects any args
			it(testMessage, (done) => {
				process.env.NODE_ENV = 'development';
				testFunction((...doneArgs) => {
					delete process.env.NODE_ENV;
					done(...doneArgs);
				});
			});
		} else if (isPromise(testFunction)) {
			it(testMessage, async () => {
				process.env.NODE_ENV = 'development';
				await testFunction()
				.finally(() => {
					delete process.env.NODE_ENV;
				});				
			});
		} else {
			it(testMessage, () => {
				process.env.NODE_ENV = 'development';
				testFunction();
				delete process.env.NODE_ENV;
			});
		}
	}
);

module.exports = handleDevFlagTest;
