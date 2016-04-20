'use strict';
module.exports = function (href, content, icon, classes, blank) {
    var a = {
        tag: 'a',
        attr: {
            class: classes,
            href: href
        },
        content: content,
        icon: icon
    };
    if (blank) {
        a.attr.target = '_blank';
    }
    return a;
};