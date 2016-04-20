'use strict';
module.exports = function saveButton(app) {
    return {
        tag: 'button',
        attr: { class: 'save' },
        icon: 'check',
        content: app.translate('btns.save')
    };
};