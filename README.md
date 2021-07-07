# threadneedle
An opinionated ORM-style abstraction layer for interacting with third party HTTP-based APIs. Built on top of the fantastic [Needle](https://github.com/trayio/needle) API to provide a more structured and declarative framework.

Threadneedle works by allowing you to declare and run various API methods, easily handle expected responses, and providing you with a vastly simpler framework for running requests in your core code.

## Installation

```
npm install @trayio/threadneedle --save
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

# API

* [addMethod](#addmethod)
* [global](#global)
* [SOAP Mode](#soap-mode)
* [Smart Substitution](smartSubstitution.md)


## addMethod

The vast majority of threadneedle focuses around this singular method. Whenever you run `addMethod`, you're adding another method to the core `threadneedle` object.

### addMethod - REST template

You can declare template-style parameters to be passed into specific fields, using Mustache-style templating.

Parameters are (in the prefered order):

* globals (advanced flag)
* [before](#before)
* [method](#method) (required)
* [options](#options)
* [url](#url) (required)
* [query](#query)
* [data](#data)
* [beforeRequest](#beforerequest)
* [expects](#expects)
* [notExpects](#notexpects)
* [afterSuccess](#aftersuccess)
* [afterFailure](#afterfailure)
* [afterHeaders](#afterheaders) (advanced)

`addMethod` uses JavaScript promises (using [When.js](https://github.com/cujojs/when)), which allows for the chaining of multiple API calls together, and smart error handling.

Each of the properties you can pass to `addMethod` are described below:

### before

If you'd like to map or alter the `params` before running the main request, you can use
the `before` function argument.

Runs **before** any templating or requests.

```js
{
  method: 'get',
  url: 'https://{{dc}}.api.mailchimp.com/2.0/users?apikey={{apiKey}}',
  expects: 200,
  before: function (params) {
    params.dc = 'us5';
    return params;
    // You can also return a promise which should resolve having modified the params
  }
}
```

### method (required)

The HTTP verb to use for the request. Valid values are:

* `post`
* `put`
* `delete`
* `get`
* `patch`
* `head`

The values you declare here are **not case sensitive**.

As of v1.11.0, `method` can be a function or mustaching can be used to provide one of the valid values.

### options

Other options you'd like to apply to the request. These directly correspond directly to the [request options](https://github.com/trayio/needle#request-options) defined in Needle.

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

### url (required)

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

### query

If you have to specify a lot of parameters in the query string for the URL, you can specify them here.
The data will be URL encoded and appended at the end of the endpoint.

Templating is supported, as with the `endpoint` and `data` parameters.


### data

The payload you'd like to send to the third party. Relevant for methods which accept a body, such as `POST`, `PUT`, `DELETE,` and `PATCH`.

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




### beforeRequest

If you'd like to do some final checks and tweaks **before** the actual request is made, but **after**
all parameters have been templated, use this method.

```js
{
  method: 'get',
  url: 'https://{{dc}}.api.mailchimp.com/2.0/users?apikey={{apiKey}}',
  expects: 200,
  beforeRequest: function (request, params) {
    // Parameters on the `request` are `url`, `data`, `options`.
    // `data` will be undefined for GET, HEAD, and OPTIONS requests.

    delete request.data.id; // modification
    return request;
    // You can also return a promise which should resolve having modified the request
  }
}
```

### expects

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
  expects: function (res) {
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

### notExpects

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


### afterSuccess

Sometimes you'll want to translate, format, or map the success response data in some way.
You can use the `afterSuccess` function argument to do this:

```js
{
  method: 'get',
  url: 'https://{{dc}}.api.mailchimp.com/2.0/users?apikey={{apiKey}}',
  expects: 200,
  afterSuccess: function (body, params, res) {
    body.name = body.first_name + ' ' + body.last_name;
    return body;
    // You can also return a promise to do async logic. It must resolve
    // with the body.
  }
}
```


### afterFailure

Sometimes you'll want to modify the failure message in some way. You can do

```js
{
  method: 'get',
  url: 'https://{{dc}}.api.mailchimp.com/2.0/users?apikey={{apiKey}}',
  expects: 200,
  afterFailure: function (err, params, res) {
    if (err.response.statusCode === 403) {
      err.code = '#oauth_refresh';
    }
    return err;
    // You can also return a promise to do async logic. It should resolve
    // with the error object.
  }
}
```

### afterHeaders

Sometimes you'll want to modify the response headers in some way. You can do

```js
{
  method: 'get',
  url: 'https://{{dc}}.api.mailchimp.com/2.0/users?apikey={{apiKey}}',
  expects: 200,
  afterHeaders: function (error, params, body, res) {
    return {
        operation: 'cleanup_op',
        data: {
            abc: '123'
        }
    };

    // You can also return a promise to do async logic. It should resolve
    // with the header object.
  }
}
```
`afterHeaders` must always return an object, else it will be ignored.

The parameters are:
- error - this will be null for a resolving afterSuccess, else it will contain the error
- params
- body
- res

**Note:** if afterHeaders rejects/errors, this error will take precedence over any other error and will form the `body` part of the response. Also, the local `afterHeaders` will merge with the global one if provided, with local object taking precedence.


### addMethod - REST template - response
A method which runs a `REST template` will always return the response in a particular format:
```json
{
    "headers": {},
    "body":  {}
}
```
The `body` will contain the main response or error, while `headers` is available for specifying additional meta data via `afterHeaders`.

### addMethod - function

Sometimes you'll have a method which isn't REST-based, or you'd like to use a third-party wrapper.

While this behaviour should be kept to a minimum, you can simply pass a function (that should return a promise)
when calling `addMethod`, for you to run your own asynchronous logic:

```js
var when = require('when');

threadneedle.addMethod('myWeirdMethod', function (params) {
  return when.promise(function (resolve, reject) {

    // random async logic

    resolve();

  });
});
```

Another good use-case here is to create a method that wraps around a chain of other methods.
Because these methods are run in the context where `this` is `threadneedle`, you can easily
access the other methods you've declared:

```js
threadneedle.addMethod('myChainedMethod', function (params) {
  var self = this;
  return when.promise(function (resolve, reject) {

    self.getMetaData(params)

    .then(function (metaData) {
      return self.getLists({
        dc: metaData.dc,
        apiKey: params.apiKey
      });
    })

    .done(resolve, reject);

  });
});
```


## global

Typically you'll be creating one threadneedle instance for each third party API service
(MailChimp, Facebook etc) you're integrating with. Sometimes these services will have
generic response status codes and authentication criteria - and you'll want to write
the logic once, rather than add the same logic across every method config.

The philosophy of the `global` system is that the less you have to write in each method config,
the better.

The parameters correspond directly to those for [addMethod](#addmethod):

* [baseUrl](#baseurl-1)
* [data](#data-1)
* [query](#query-1)
* [options](#options-1)
* [expects](#expects-1)
* [notExpects](#notexpects-1)
* [before](#before-1)
* [beforeRequest](#beforerequest-1)
* [afterSuccess](#aftersuccess-1)
* [afterFailure](#afterfailure-1)
* [afterHeaders](#afterHeaders-1)

Example usage:

```js
threadneedle.global({
  baseUrl: 'https://{{dc}}.api.mailchimp.com/2.0',
  before: function (params) {
    params.dc = 'us5';
  }
});
```


### baseUrl

A base level URL. (Previously `url`) Automatically gets **prepended** to the individual method URL **unless** the
method URL starts with http(s)://. (In which case the global `baseUrl` field has no affect on the call)

```js
// global config
{
  baseUrl: 'https://{{dc}}.api.mailchimp.com/2.0'
}

// and then in `addMethod`:
threadneedle.addMethod({
  url: '/lists/{{id}}',
  method: 'get'
})
```

If `baseUrl` is a function, it will get evaluated and prepended.


### data

Data for POST, PUT etc that you want to send in every request. Gets deep extended by the `data`
config in the individual methods.

```js
{
  data: {
    id: '{{id}}'
  }
}
```

You can also run this as a function, which should return an object.


### query

Query string data that you'd like to send in every request. Gets extended by the `query` object
in each individual method before being encoded into a string.

Useful for things like passing API keys in the query string:

```js
{
  query: {
    apikey: '{{apiKey}}'
  }
}
```

You can also run this as a function, which should return an object.


### options

The options for the request. Gets deep extended into the `options` object. Great for things
like header based authentication.

```js
{
  options: {
    username: 'chris',
    password: 'topher'
  }
}
```

You can also run this as a function, which should return an object.


### expects

Global [expects](#expects) config. Good for things like always expecting all calls to return with a
specific set of status codes.

Gets extended if declared in the individual method config.

```js
{
  expects: {
    statusCode: [200, 201]
  }
}
```

You can also run this as a function,


### notExpects

Global [notExpects](#notexpects) config. Good for things like specifically flagging certain status
codes as errors, or for automatically erroring when an `errors` field appears in the response.

Gets extended if declared in the individual method config.

```js
{
  notExpects: {
    body: 'errors'
  }
}
```

You can also run this as a function.


### before

A function to run before every query happens. Runs **before** the `before` function declared
in the model, if specified.

```js
{
  before: function (params) {
    params.dc = 'us5';
    return params;

    // You can also return a promise which should resolve with the params.
  }
}
```


### afterSuccess

Runs after a method runs successfully, immediately **before** the `afterSuccess` function
of the individual method.

```js
{
  afterSuccess: function (body, params, res) {
    body.errors = [];

    // You can also return a promise which should resolve having modified the body
  }
}
```


### afterFailure

Runs after a method runs successfully, immediately **before** the `afterFailure` function
of the individual method.

A good example use-case here is a generic error handler for invalid status codes. For example:

* Campaign Monitor - a `121` status code means that an access token needs refreshing
* Shopify - a `429` status code means the API limits have been exceeded

Rather than write the same code in every method, use this global method.

```js
{
  afterFailure: function (err, params) {
    if (err.response.statusCode === 429) {
      err.code = 'call_limit_exceeded';
    }

    // You can also return a promise which should resolve having modified the error
  }
}
```

### afterHeaders

Runs after a method runs successfully, immediately **before** the `afterHeaders` function
of the individual method.

If there is meta data that needs to be specified with every `REST template` method, this is a good place to set it.

```js
{
  method: 'get',
  url: 'https://{{dc}}.api.mailchimp.com/2.0/users?apikey={{apiKey}}',
  expects: 200,
  afterHeaders: function (error, params, body, res) {
    return {
        operation: 'cleanup_op',
        data: {
            abc: '123'
        }
    };

    // You can also return a promise to do async logic. It should resolve
    // with the header object.
  }
}
```


<br/>
<br/>

## SOAP mode
As of v1.3.0, threadneedle has added support for SOAP, on both a global and method level.
The library used is [node-soap](https://github.com/vpulim/node-soap)

This mode can be initialised by adding the following flag to the (global) model: `type: 'SOAP'`.
If the flag is set on the global level, then threadneedle will only accept valid SOAP objects and functions as methods (and REST will not be supported). However, if the flag is only used by a method, then only the method will be in SOAP mode, but will expect all required fields to be provided.

### Global fields
The only required field here is:
- `wsdl` (string)

An optional field unique to globals is:
- `baseMethod` (string)



### Method fields
The only required field here is:
- `method` (**note**: this is different from the REST `method`, as this now expects the name of the actual SOAP method to execute)


**Note**: `url` is not supported in SOAP mode (and therefore ignored).

### Optional fields (global and methods)
The following fields are pretty much the same as the REST versions, unless explicitly stated otherwise:
- `before`
- `options`  (different - this allows setting the SOAP client up - see the library for valid fields)
    - `headers`  (different - this is an extra field recognised by threadneedle which adds headers to the client using the library's `client.addSoapHeader`)
- `data`
- `expects` / `notExpects` (functions only, REST shortcuts will error)
- `beforeRequest`
- `afterSuccess`
- `afterFailure`
- `afterHeaders`


**Note**: The following are not supported and will be ignored:
- `baseUrl`
- `url`
- `query`

### addMethod - SOAP template - response
The response format is identical to the REST template response.
