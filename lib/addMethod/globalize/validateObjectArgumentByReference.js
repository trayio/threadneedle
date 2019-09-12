const _ = require('lodash');

module.exports = function (referenceModificationErrorMessage, nonObjectErrorMessage) {
	return (referencedObject) => {
		const originalObjectCopy = _.cloneDeep(referencedObject);
		/*
			If function returns undefined, then default behaviour assumes no
			modification to	original object and it is passed on. In the event
			modification has occured by reference, warn/error accordingly.
			Else, ensure returned value is an object.
		*/
		return (returnedObject) => {
			if (_.isUndefined(returnedObject)) {
				if (!_.isEqual(referencedObject, originalObjectCopy)) {
					if (process.env.NODE_ENV === 'development') {
						throw new Error(referenceModificationErrorMessage);
					} else {
						// eslint-disable-next-line no-console
						console.warn(referenceModificationErrorMessage);
					}
				}
				/*
					Need another cloneDeep, else originalObjectCopy variable
					becomes a reference for method config's function
				*/
				return _.cloneDeep(originalObjectCopy);
			} else if (_.isPlainObject(returnedObject)) {
				return returnedObject;
			}
			throw new Error(nonObjectErrorMessage);
		};
	};
};
