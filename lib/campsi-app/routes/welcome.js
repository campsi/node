var Route = require('../route');

var welcome = new Route({
    name: 'root',
    path: '/',
    layout: {
        welcome: ['w100', 'main']
        //projects: ['w20', 'l80']
    }
    //resources: ['projects']
});

module.exports = welcome;