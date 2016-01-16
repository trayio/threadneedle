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
  url: 'https://api.mailchimp.com/list?apikey={{apiKey}}'
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

Each of the properties you can pass to `addMethod` are described below:

### method *

The HTTP method you'd like to use. Valid values are:

* `post`
* `put`
* `delete`
* `get`
* `head`

The values you declare here are case-insensitive.
