var Campsi = require('campsi');

require('./form/field/component');
require('./form/component');
require('./array/item/component');
require('./array/component');
require('./checkbox/component');
require('./text/component');
require('./text/area/component');
require('./text/code/component');
require('./file/component');
require('./file/image/component');
require('./handlebars/component');
require('./select/dropdown/component');


console.info("core components finished loading", Campsi.getLoadedComponents());

if (window.onComponentsReady) {
    window.onComponentsReady();
}