var auth = require('./auth');
$('button.login').click(function () {
    auth(null, {token: $(this).data('token')});
});