var auth = require('./browser/auth');

auth('loginOrSignup', {redirectTo: window.redirectTo}, {closable: false});