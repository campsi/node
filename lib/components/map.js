require('campsi');

require('./array/component');
require('./array/item/component');
require('./button/component');
require('./checkbox/component');
require('./checkbox/group/component');
require('./date/component');
require('./file/component');
require('./file/image/component');
require('./form/component');
require('./form/field/component');
require('./geo/address/component');
require('./handlebars/component');
require('./number/component');
require('./number/rating/component');
require('./select/dropdown/component');
require('./select/radios/component');
require('./text/component');
require('./text/area/component');
require('./text/code/component');
require('./text/password/component');
//require('./select/reference/component');

if (window.onComponentsReady) {
    window.onComponentsReady();
}