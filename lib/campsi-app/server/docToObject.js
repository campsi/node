var toObject = function (document) {
    var property;
    var t = typeof document;
    var seen = [];
    var object;

    if (typeof document.toObject === 'function') {
        return document.toObject();
    }

    if (t === 'undefined' || t === 'boolean' || t === 'string') {
        return document;
    }

    if(Array.isArray(document)){
        object = [];
    } else {
        object = {};
    }

    for (property in document) {
        if (document.hasOwnProperty(property)) {
            object[property] = toObject(document[property]);
        }
    }

    return object;
};

module.exports = toObject;