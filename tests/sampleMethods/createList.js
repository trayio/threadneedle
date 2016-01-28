module.exports = {
  url: 'https://{{dc}}.api.mailchimp.com/2.0/lists/list?apikey={{apiKey}}',
  method: 'post',
  data: {
    name: '{{name}}'
  },
  expects: 200
};