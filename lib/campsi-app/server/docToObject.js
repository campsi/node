var toObject = function (document) {
    var property;
    var object = Array.isArray(document) ? [] : {};

    if (['undefined', 'boolean', 'string'].indexOf(typeof document) !== -1) {
        return document;
    }

    if (typeof document.toObject === 'function') {
        return document.toObject();
    }

    for (property in document) {
        if (document.hasOwnProperty(property)) {
            object[property] = toObject(document[property]);
        }
    }

    return object;
};

module.exports = toObject;