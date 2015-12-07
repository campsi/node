var Loader = function () {
    this.loaded = {};
};

Loader.prototype.js = function (url, callback) {

    var r = false, script = document.createElement('script'), loader = this;

    if (loader[url]) {
        if (callback) {
            callback.call();
        }
        return;
    }

    script.type = 'text/javascript';
    script.src = url;
    script.onerror = function () {
        throw new Error('unable to fetch component');
    };
    script.onload = script.onreadystatechange = function () {
        if (!r && (!this.readyState || this.readyState === 'complete')) {
            r = true;
            loader.loaded[url] = true;
            if (callback) {
                callback.call();
            }
        }
    };

    document.body.appendChild(script);
};

Loader.prototype.css = function (url, callback) {

    var r = false, link = document.createElement('link'), loader = this;

    if (loader[url]) {
        if (callback) {
            callback.call();
        }
        return;
    }

    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = link.onreadystatechange = function () {
        if (!r && (!this.readyState || this.readyState === 'complete')) {
            r = true;
            if (callback) callback.call();
        }
    };

    document.head.appendChild(link);

};

module.exports = Loader;