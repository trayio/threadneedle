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
			// console.log('returnedObject', returnedObject);
			if (_.isUndefined(returnedObject)) {
				if (!_.isEqual(referencedObject, referencedObjectCopy)) {
					if (process.env.NODE_ENV === 'development') {
						throw new Error(referenceModificationErrorMessage);
					} else {
						// eslint-disable-next-line no-console
						console.warn(referenceModificationErrorMessage);
						//Maintain backwards compatibility in non-dev mode
						return referencedObject;
					}
				}
				/*
					Need another cloneDeep, else referencedObjectCopy variable
					becomes a reference for method config's function
				*/
				/*
					TODO: introduce breaking change to introduce via a flag
					(which also avoids the return of the reference object above)
				*/
				return _.cloneDeep(referencedObjectCopy);
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
