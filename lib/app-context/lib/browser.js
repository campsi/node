module.exports = {
    _load: function (reload, type, url, cb) {
        var self = this;

        if (typeof this.__cache === 'undefined') {
            this.__cache = {};
        }

        if (this.__cache[url] && reload === false) {
            return cb(this.__cache[url]);
        }

        this._reload(type, url, cb);
    },

    _reload: function (type, url, cb) {
        var self = this;
        $.getJSON(url, function (data) {
            self['_' + type] = data;
            self.__cache[url] = data;
            cb(data);
        });
    }
}