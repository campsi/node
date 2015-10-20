var lock = new Auth0Lock('psmD1OCt9ctb8vQOeyXohon3dUVnOQfT', 'campsi.eu.auth0.com');

function signin() {
    lock.show({
        callbackURL: 'http://localhost:3000/callback?token=' + invitationToken
        , responseType: 'code'
        , authParams: {
            scope: 'openid profile'
        }
    });
}

$('button.login').click(signin);
