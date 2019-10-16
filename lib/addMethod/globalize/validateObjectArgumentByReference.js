const _ = require('lodash');

module.exports = function (referenceModificationErrorMessage, nonObjectErrorMessage) {
	return (referencedObject) => {
		let referencedObjectCopy = _.cloneDeep(referencedObject);
		/*
			If function returns undefined, then default behaviour assumes no
			modification to	original object and it is passed on. In the event
			modification has occured by reference, warn/error accordingly.
			Else, ensure returned value is an object.
		*/
		return (returnedObject) => {
			if (_.isUndefined(returnedObject)) {
				if (!_.isEqual(referencedObject, referencedObjectCopy)) {
					if (process.env.NODE_ENV === 'development') {
						throw new Error(referenceModificationErrorMessage);
					} else {
						// eslint-disable-next-line no-console
						console.warn(referenceModificationErrorMessage);
					}
				}
				/*
					Maintain backwards compatibility in non-dev mode. Update
					copy for 2nd time validation.
					Threadneedle v2 (breaking change) needs to change this to
					`return _.cloneDeep(referencedObjectCopy);` or similar -
					i.e. on undefined, pass on original/prior `params`
				*/
				referencedObjectCopy = _.cloneDeep(referencedObject);
				return referencedObject;
			} else if (_.isPlainObject(returnedObject)) {
				/*
					 If an object is returned, at this point the
					 referencedObject should be updated to reflect the returned
					 object, as this is the object to be used moving forward
				 */
				referencedObject = returnedObject;
				referencedObjectCopy = _.cloneDeep(returnedObject);
				return returnedObject;
			}
			throw new Error(nonObjectErrorMessage);
		};
	};
};
