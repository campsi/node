module.exports = {
    toObject: function (item) {
        if (typeof item === 'undefined' || typeof item.toObject === 'undefined') {
            return item;
        }

        var normalizeMongoIdToString = function (item) {
            var prop;
            var val;
            for (prop in item) {
                if (item.hasOwnProperty(prop)) {
                    val = item[prop];
                    if (prop === '_id') {
                        item._id = val.toString();
                        continue;
                    }
                    if (typeof val === 'array') {
                        item[prop] = val.map(normalizeMongoIdToString);
                    } else if (Object.prototype.toString.call(val) === '[object Object]') {
                        item[prop] = normalizeMongoIdToString(val);
                    } else if (typeof val._bsontype !== 'undefined') {
                        item[prop] = val.toString();
                    }
                }
            }
            return item;
        };

        return normalizeMongoIdToString(item.toObject());

    }
};