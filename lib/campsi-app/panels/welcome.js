'use strict';
var Panel = require('../panel');
var button = require('./buttons/button');
var linkButton = require('./buttons/linkButton');
module.exports = function (app) {
    return new Panel({
        title: '',
        id: 'welcome',
        component: 'campsi/landing',
        leftButtons: [],
        theme: 'dark',
        actions: ['login', 'signup']
    });
};