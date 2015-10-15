var equals = require('equals');

module.exports = function (prev, next) {

    var diff = [];

    var indexCanOnlyBeFoundOnce = [];
    var indexOfEquals = function (array, value) {
        var index = -1;
        array.forEach(function (el, i) {
            if (indexCanOnlyBeFoundOnce.indexOf(i) === -1 && equals(el, value)) {
                index = i;
                indexCanOnlyBeFoundOnce.push(i);
            }
        });
        return index;
    };


    var foundIndexes = [];

    prev.forEach(function (itemPrev, indexPrev) {
        var indexNext = indexOfEquals(next, itemPrev);
        if (indexNext >= 0) {
            foundIndexes.push(indexNext);
        }
        diff.push({
            oldIndex: indexPrev,
            newIndex: indexNext
        });

    });

    next.forEach(function (itemNext, indexNext) {
        if (foundIndexes.indexOf(indexNext) === -1) {
            diff.push({
                oldIndex: -1,
                newIndex: indexNext
            })
        }
    });

    return diff;
};