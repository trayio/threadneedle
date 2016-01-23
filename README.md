# threadneedle
An opinionated ORM-style abstraction layer for interacting with third party HTTP-based APIs. Built on top of the fantastic [Needle](https://github.com/tomas/needle) API to provide a more structured and declarative framework.

Threadneedle works by allowing you to declare and run various API methods, easily handle expected responses, and providing you with a vastly simpler framework for running requests in your core code.

## Installation

```
npm install threadneedle --save
```


## Quick start

Create a new instance of threadneedle:

```js
var ThreadNeedle = require('threadneedle');
var threadneedle = new ThreadNeedle();
```

Then, run `threadneedle.addMethod` to declare a method:

```js
threadneedle.addMethod('getLists', {
  url: 'https://{{dc}}.api.mailchimp.com/2.0/lists/list?apikey={{apiKey}}',
  method: 'get',
  expects: 200
});
```

And to actually run the method and get the MailChimp lists: 

```js
threadneedle.getLists({
  apiKey: '123',
  dc: 'us5'
})

.done(function (result) {
  console.log(result);
}, function (error) {
  console.log(error);
});
```

# API

* [addMethod](#addmethod)
* [addMethodsInDirectory](#addmethodsindirectory)


## addMethod

The vast majority of threadneedle focuses around this singular method. Whenever you run `addMethod`, you're adding another method to the core `threadneedle` object. 

You can declare template-style parameters to be passed into specific fields, using Mustache-style templating. 

Required parameters are:

* `url`
* `method`

`addMethod` uses JavaScript promises (using [When.js](https://github.com/cujojs/when)), which allows for the chaining of multiple API calls together, and smart error handling.

Each of the properties you can pass to `addMethod` are described below:

### method

The HTTP method you'd like to use. Valid values are:

* `post`
* `put`
* `delete`
* `get`
* `head`

The values you declare here are case-insensitive.


### url

The URL you'd like to request to go to. This can be specified as a string, optionally using Mustache-style templating:

```js
{
  method: 'get',
  url: 'https://{{dc}}.api.mailchimp.com/2.0/lists/list?apikey={{apiKey}}'
}
```

You can also specify the URL as a function. In this case, the `params` that would be templated into the string are provided in the `params` object:

```js
{
  method: 'get',
  url: function (params) {
    return 'https://'+params.dc+'.api.mailchimp.com/2.0/lists/list?apikey='+params.apiKey;
  }
}
```

### data 

The payload you'd like to send to the third party. Relevant for `put`, `delete,` and `post` methods only.

As with the URL, you can provide Mustache parameters here:

```js
{
  method: 'post',
  url: 'https://{{dc}}.api.mailchimp.com/2.0/lists/subscribe',
  data: {
    id: '{{listId}}',
    apikey: '{{apiKey}}'
  }
}
```

Or if you'd prefer, as a function:

```js
// On the `data` object level:
{
  method: 'post',
  url: 'https://{{dc}}.api.mailchimp.com/2.0/lists/subscribe',
  data: function (params) {
    return {
      id: params.listId,
      apikey: params.apiKey
    };
  }
}

// On the `data` key level: (recursive)
{
  method: 'post',
  url: 'https://{{dc}}.api.mailchimp.com/2.0/lists/subscribe',
  data: {
    apikey: '{{apiKey}}',
    id: function (params) {
      return String(params);
    }
  }
}
```

### query

If you have to specify a lot of parameters in the query string for the URL, you can specify them here.
The data will be URL encoded and appended at the end of the endpoint.

Templating is supported, as with the `endpoint` and `data` parameters.


### options

Other options you'd like to apply to the request. These directly correspond directly to the [request options](https://github.com/tomas/needle#request-options) defined in Needle.

Also gets templated.

For example, to send & receive the data as json, just declare the `json` option:

```js
{
  method: 'post',
  url: 'https://{{dc}}.api.mailchimp.com/2.0/lists/subscribe',
  data: {
    id: '{{listId}}',
    apikey: '{{apiKey}}'
  },
  options: {
    json: true
  }
}
```

### expects

Usually you'll want to do some kind of validation after you've made a request to a third party service. Typically validations will be one of the following:

* Status codes - was the result a `200` (good) or a `401` (bad) request?
* Body - what's the response returned? Does it have an `error` message, or similar?

These can be declared within the `expects` object:

```js
{
  expects: {
    statusCode: 200,
    body: 'euid'
  }
}
```

The above expects the response to return a `200` response status code, and for the response body to have the text `euid` in. If either of these things fail to happen, the method will error.

You can also specify these parameters as arrays:

* For `statusCode`, if __ANY__ of the status codes match the response the validation will pass.
* For `body`, if __ALL__ of the string texts are found in the response, the validation will pass.

You can also declare `expects` as a function, where you can run your own custom validation logic. If your logic determines there's an error, you should return it as a string from the function:

```js
{
  expects: function (res, body) {
    if (res.statusCode !== 201) {
      return 'Invalid status code';
    }
  }
}
```

You can also specify the above in shorthand, declaring the status codes OR body strings at the top level:

```js
{
  expects: 201
}

{
  expects: ['euid', 'email']
}
```

### notExpects

The counterpart to `expects`, except that if __ANY__ of the specified status codes / body strings are found, the method will fail:

```js
{
  notExpects: {
    statusCode: [401, 404, 403],
    body: 'error'
  } 
} 
```


Like `expects`, `notExpects` can be specified shorthand, or as a function. 


### Function input

Sometimes you'll have a method which isn't REST-based, or you'd like to use a third-party wrapper. 

While this behaviour should be kept to a minimum, you can simply pass a function (that should return a promise)
when calling `addMethod`, for you to run your own asynchronous logic:

```js
threadneedle.addMethod('myWeirdMethod', function (params, utils) {

  return when.promise(function (resolve, reject) {

    // random async logic

    resolve();

  });
});
```

Another good use-case here is to create a method that wraps around a chain of other methods. Because these methods
are run in the context where `this` is `threadneedle`, you can easily access the other methods you've declared.

The `utils` object contains some stuff that may be useful:

* `_`: the Lodash module
* `when`: the When.js module
* `needle`: the raw Needle module


## addMethodsInDirectory

While using `addMethod` directly is useful, often it can be simpler and more declarative to place all your methods in a directory (one file per method), and then require the whole directory, running `addMethod` on each one:

```js
threadneedle.addMethodsInDirectory(__dirname+'/methods');
```

This lends itself to a simple API module paradign, where the entire API is `export`ed:


```js
// mySampleMethod.js

module.exports = {
  method: 'get',
  url: '...'
};
```

```js
// api.js
var ThreadNeedle = require('threadneedle');
var threadneedle = new ThreadNeedle();

threadneedle.addMethodsInDirectory(__dirname+'/methods');

module.exports = threadneedle;
```


```js
// someconsumerfile.js
var api = require('../api');

api.getLists({
  // ...
});
```


## Known limitations

### Typecasting: 

When parameters are substituted into objects like `data`, they are automatically typecasted using [Mout](moutjs.com/docs/latest/string.html#typecast) when subtituted into the Mustache templates.

This results in the following behaviour:

```js
// myMethod.js
{
  method: 'get',
  url: 'http://mydomain.com/api'
  data: {
    age: '{{age}}'
  },
  options: {
    json: true
  }
}

// Running the method
threadneedle.myMethod({
  age: '25'
})

// The raw JSON body sent:
{
  age: 25 // should be '25'
}
```

Usually this kind of behaviour is harmless, but occasionally you might accidentally send an ID as a number 
instead of a string, for example.

To get around this, use a function wrapper for the whole `data` object, or for the parameter individually.

TODO - respect the type of the param inputted on single parameter substitutions.

