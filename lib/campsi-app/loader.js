var Campsi = require('campsi');

Campsi.loader.js('/javascripts/campsi.components.js');

var loadHandler;

window.onComponentsReady = function () {
    Campsi.loader.js('/javascripts/campsi.editor.js');
};

window.onCampsiComponentsReady = function () {
    loadHandler();
};

module.exports = function (handler) {
    loadHandler = handler;
};