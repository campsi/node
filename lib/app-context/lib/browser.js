module.exports = {
    _load: function (type, url, cb) {
        var self = this;
        $.getJSON(url, function (data) {
            self['_' + type] = data;
            cb(data);
        });
    }
}