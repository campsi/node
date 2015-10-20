var instance;
var changeHandler;

var close = function () {
    $('#modal').hide();
};

var open = function (options, value, onChange) {
    changeHandler = onChange;
    if (typeof ace === 'undefined') {
        Campsi.loader.js('/lib/ace-builds-bower-patched/src-min-noconflict/ace.js', function () {
            var waitForAce = function (ready) {

                if (typeof ace === 'undefined') {
                    setTimeout(function () {
                        waitForAce(ready);
                    }, 100);
                } else {
                    ready();
                }
            };

            waitForAce(function () {
                instance = ace.edit('code-editor');
                instance.getSession().setMode(options.mode);
                instance.setTheme('ace/theme/monokai');
                instance.setValue(value);
                $('#modal').show();
            });
        });
    } else {
        instance.setValue(value);
        $('#modal').show();
    }
};

module.exports = {
    close: close,
    open: open,
    change: changeHandler,
    instance: instance
};