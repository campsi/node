//var lock = new Auth0Lock('psmD1OCt9ctb8vQOeyXohon3dUVnOQfT', 'campsi.eu.auth0.com');
//var userProfile;
//
//$('.login').click(function(e) {
//    e.preventDefault();
//    lock.show(function(err, profile, token) {
//        if (err) {
//            // Error callback
//            alert('There was an error');
//        } else {
//            // Success callback
//
//            // Save the JWT token.
//            localStorage.setItem('userToken', token);
//            localStorage.setItem('userProfile', profile);
//
//            // Save the profile
//            userProfile = profile;
//        }
//    });
//});
//
//$.ajaxSetup({
//    'beforeSend': function(xhr) {
//        if (localStorage.getItem('userToken')) {
//            xhr.setRequestHeader('Authorization',
//                'Bearer ' + localStorage.getItem('userToken'));
//        }
//    }
//});

var lock = new Auth0Lock('psmD1OCt9ctb8vQOeyXohon3dUVnOQfT', 'campsi.eu.auth0.com');

function signin() {
    lock.show({
        callbackURL: 'http://localhost:3000/callback'
        , responseType: 'code'
        , authParams: {
            scope: 'openid profile'
        }
    });
}

$('.login').click(signin);