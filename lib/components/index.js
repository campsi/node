var isBrowser = require('is-browser');

module.exports = {
    'array': require('./array/component'),
    'array/item': require('./array/item/component'),
    'button': require('./button/component'),
    'checkbox': require('./checkbox/component'),
    'checkbox/group': require('./checkbox/group/component'),
    'date': require('./date/component'),
    'file': require('./file/component'),
    'file/image': require('./file/image/component'),
    'form': require('./form/component'),
    'form/field': require('./form/field/component'),
    'geo/address': require('./geo/address/component'),
    'handlebars': require('./handlebars/component'),
    'number': require('./number/component'),
    'number/rating': require('./number/rating/component'),
    'payment/credit-card': require('./payment/credit-card/component'),
    'select/dropdown': require('./select/dropdown/component'),
    'select/radios': require('./select/radios/component'),
    'text': require('./text/component'),
    'text/area': require('./text/area/component'),
    'text/code': require('./text/code/component'),
    'layout/divider': require('./layout/divider/component'),
    'text/password': require('./text/password/component'),
    'text/rich': require('./text/rich/component'),
    'url': require('./url/component')
};

if (isBrowser && window.onComponentsReady) {
    window.onComponentsReady();
}