var toObject = function (v) {
    var k;
    var t = typeof v;

    if (typeof v.toObject === 'function') {
        return v.toObject();
    }

    if (t === 'undefined' || t === 'boolean') {
        return v;
    }

    for (k in v) {
        if (v.hasOwnProperty(k)) {
            v[k] = toObject(v[k]);
        }
    }

    return v;
};

module.exports = toObject;