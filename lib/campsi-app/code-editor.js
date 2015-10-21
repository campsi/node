var Campsi = require('campsi');

var CodeEditor = function () {
console.info("init code editor");
};

CodeEditor.prototype.open = function (options, value, onChange) {
    var instance = this;
    instance.changeHandler = onChange;
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
                instance.editor = ace.edit('code-editor');
                instance.editor.getSession().setMode(options.mode);
                instance.editor.setTheme('ace/theme/monokai');
                instance.editor.setValue(value);
                $('#modal').show();
            });
        });
    } else {
        instance.editor.setValue(value);
        $('#modal').show();
    }
};
CodeEditor.prototype.triggerChange = function() {
    this.changeHandler(this.editor.getValue());
};

CodeEditor.prototype.close = function () {
    $('#modal').hide();
};

module.exports = new CodeEditor();