var Campsi = require('campsi');


Campsi.wakeUp($('#contact > form > .component')[0], function(comp){
    comp.attachEvents();
});