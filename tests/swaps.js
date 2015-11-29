/**
 * Created by romain on 29/11/2015.
 */
var equals = require('equals');
require('array-swap');


var prev = ['a', 'b', 'c', 'd', 'e'];
var next = ['z', 'd', 'a', 'b', 'e', 'y', 'a'];
var items = [];

prev.forEach(function (item) {
    items.push({value: item});
});
var arrayIndexOfEquals = function (arr, item) {
    var index = -1;
    arr.forEach(function (obj, i) {
        if (equals(item, obj)) {
            index = i;
        }
    });
    return index;
};

var operations = [];

var prevCopy = prev.slice();
next.forEach(function (nextItem, nextIndex) {
    var prevIndex = arrayIndexOfEquals(prevCopy, nextItem);

    if (prevIndex > -1) {
        if (prevIndex !== nextIndex) {
            operations.push({type: 'move', prev: prevIndex, next: nextIndex});
        } else {
            operations.push({type: 'keep', index: prevIndex});
        }
        prevCopy[prevIndex] = undefined;
    } else {
        operations.push({type: 'create', index: nextIndex});
    }
});

var nextCopy = next.slice();
prev.forEach(function (prevItem, prevIndex) {
    var nextIndex = arrayIndexOfEquals(nextCopy, prevItem);
    if (nextIndex == -1) {
        operations.push({type: 'remove', index: prevIndex});
        nextCopy[nextIndex] = undefined;
    }
});


var i = operations.length - 1;
for (; i > -1 ; i--){
    var op = operations[i];
    if(op.type === 'create'){
        var j = operations.length - 1;
        var found = false;
        for(; j > -1; j--){
            if(operations[j].type == 'remove'){
                operations[i] = {type: 'move', prev: operations[j].index, next: op.index};
                operations.splice(j, 1);
            }
        }
    }
}

console.info(operations);