# threadneedle
An opinionated abstraction layer for interacting with third party HTTP-based APIs. Built on top of the fantastic [Needle](https://github.com/tomas/needle) API to provide a more structured and declarative framework.

Threadneedle works by allowing you to declare various API methods, providing you with a vastly simpler framework for running the actual requests in your core code.

## Installation

```
npm install threadneedle
```


## Quick start

### Initialisation

Create a new instance of threadneedle:

```
var ThreadNeedle = require('threadneedle');
var threadneedle = new ThreadNeedle();
```

Then, run `threadneedle.addMethod` to declare a method:

```
threadneedle.addMethod('getLists', {
  url: 'https://api.mailchimp.com/list?apikey={{apiKey}}'
  method: 'get',
  expects: 200
});
```

And to actually run the method and get the MailChimp lists: 

```
threadneedle.getLists({
  apiKey: '123'
})

.done(function (result) {
  console.log(result);
});
```


