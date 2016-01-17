var assert       = require('assert');
var _            = require('lodash');
var substitute   = require('../lib/addMethod/substitute');


describe('#substitute', function () {

  it('should substitute into string templates', function () {
    var url = 'https://{{dc}}.api.mailchimp.com/2.0/lists/list?apikey={{apiKey}}';
    var output = substitute(url, {
      dc: 'us5',
      apiKey: '123'
    });
    assert.strictEqual(output, 'https://us5.api.mailchimp.com/2.0/lists/list?apikey=123');
  });

  it('should substitute into object templates', function () {
    var data = {
      apikey: '{{apiKey}}',
      id: '{{listId}}',
      name: 'The name is {{name}}, created at {{created}}'
    };
    var output = substitute(data, {
      apiKey: '123',
      listId: '6543',
      name: 'Chris',
      created: new Date(2016, 1, 5)
    });
    assert.deepEqual(output, {
      apikey: '123',
      id: '6543',
      name: 'The name is Chris, created at Fri Feb 05 2016 00:00:00 GMT+0000 (GMT)'
    });
  });

  it('should substitute into array templates', function () {
    var data = ['{{name}}', '{{listId}}'];
    var output = substitute(data, {
      name: 'Chris',
      listId: '123'
    });
    assert.deepEqual(output, ['Chris', '123']);
  });

  it('should substitute into array nested templates', function () {
    var data = [{ firstName: '{{name}}', list: '{{listId}}' }];
    var output = substitute(data, {
      name: 'Chris',
      listId: '123'
    });
    assert.deepEqual(output, [{ firstName: 'Chris', list: '123' }]);
  });

  it('should substitute into function templates', function () {
    var url = function (params) {
      return 'https://'+params.dc+'.api.mailchimp.com/2.0/lists/list?apikey='+params.apiKey;
    };
    var output = substitute(url, {
      dc: 'us5',
      apiKey: '123'
    });
    assert.strictEqual(output, 'https://us5.api.mailchimp.com/2.0/lists/list?apikey=123');
  });

});
