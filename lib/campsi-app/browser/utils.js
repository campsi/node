var app = document.getElementById('app');
var panels = document.getElementById('panels');
module.exports.resetScroll = function () {
    app.scrollLeft = 0;
    panels.scrollLeft = 0;
};