const devMode = process.env.NODE_ENV === 'development';
const handleDevFlagTest = (
	devMode ?
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
		} else {
			it(testMessage, () => {
				process.env.NODE_ENV = 'development';
				testFunction();
				delete process.env.NODE_ENV;
			});
		}
	}
);

module.exports = {
	handleDevFlagTest
};
