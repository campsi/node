var Campsi = require('campsi');

Campsi.drake = dragula({
    isContainer: function (el) {
        return el.classList.contains('dragzone');
    },
    moves: function (el, source, handle) {
        return el.classList.contains('draggable') && handle.classList.contains('drag-handle');
    },
    accepts: function (el, target, source, sibling) {
        var parent = $(target).closest('.dragzone').closest('.draggable');

        if (parent.length > 0 && parent[0] === el) {
            return false;
        }
        return target.classList.contains('dropzone');
    },
    invalid: function (el, target) { // don't prevent any drags from initiating by default
        return false
    },
    direction: 'vertical',         // Y axis is considered when determining where an element would be dropped
    copy: function (el, source) {
        return el.classList.contains('component') && el.classList.contains('icon');
    },
    // elements are moved by default, not copied
    revertOnSpill: true,          // spilling will put the element back where it was dragged from, if this is true
    removeOnSpill: false,          // spilling will `.remove` the element, if this is true
    mirrorContainer: document.body, // set the element that gets mirror elements appended
    useTransform: true
});