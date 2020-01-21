# Smart Substitution
Smart substitution is Threadneedle's logic for resolving mustaching and functions where applicable in configurations, such `options`, `query`, and `data` in REST method configuration.

Smart substitution can be utilised outside of Threadneedle via the following:
`const smartSubstitution = require('@trayio/threadneedle/smartSubstitution');`

## Overview
Unlike simple templating, smart substitution aims to preserve data types when possible, and as such checks when simple mustaching has been specified. In the event smart substitution is not possible, Threadneedle falls back to [mustache.js](https://github.com/janl/mustache.js/).

Furthermore, smart substitution will resolve functions by providing `params`
/input as the first and only argument, and then setting the function result as the value.

Finally, smart substitution will attempt to traverse objects and arrays. resolving templates which are nested.

## smartSubstitution(target, params)
The function accepts two arguments:
- **target** (any)- the target template to perform smart substitution on.
- **params** (object) - the data source for performing the smart substitution.

The function will return the resolved target.


## Simple mustaching
Simple mustaching are string values that contain only a single mustache template.
Example:
- The following is a simple mustache, as the string value contains simply a template:
```js
{
	url: '{{url}}'
}
```
In this case, Threadneedle will attempt smart substitution.

- The following is not a simple mustache:
```js
{
	url: 'example.com/{{endpoint}}'
}
```
In this case, Threadneedle will fallback to mustache.js.

### Pathing
Smart substitution accepts pathing as part of the template configuration in a mustache. [Lodash](https://lodash.com/docs/)'s `_.get` is utilised to resolve paths.
Example:
```js
{
	data: {
		address: {
			street: '{{billing_address.street}}'
		}
	}
}
```
This will resolve the `billing_address.street` and fetch the nested value from `params`.

## # Hash properties
Top level properties of the `params`/input that begin with `#` are known as hash properties. This is intended to provide a way of supplying data as part of `params` which is not user input and is meant to be hidden. Threadneedle will identify these properties and attempt smart substitution.
