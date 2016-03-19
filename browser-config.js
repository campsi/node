var deepcopy = require('deepcopy');
var browserConfig = deepcopy(require('./config'));

delete browserConfig.mongo_uri;
delete browserConfig.session_secret;
delete browserConfig.sendgrid_api_key;
delete browserConfig.s3;
delete browserConfig.auth0.clientSecret;

module.exports =  browserConfig;