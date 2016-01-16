# threadneedle
An opinionated abstraction layer for interacting with third party HTTP-based APIs. Built on top of the fantastic [Needle](https://github.com/tomas/needle) API to provide a more structured and declarative framework.

Threadneedle works by allowing you to declare various API methods, providing you with a vastly simpler framework for running the actual requests in your core code.

## Installation

```
npm install threadneedle
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
  apiKey: '123'
})

.done(function (result) {
  console.log(result);
});
```

# API

## addMethod

The vast majority of threadneedle focuses around this singular method. Whenever you run `addMethod`, you're adding another method to the core `threadneedle` object. 

You can declare template-style parameters to be passed into specific fields, using Mustache-style templating. 

Required parameters are:

* `url`
* `method`

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
```

