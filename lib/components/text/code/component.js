var Campsi = require('campsi');

module.exports = Campsi.extend('component', 'text/code', function ($super) {

    return {


        getDefaultValue: function () {
            return ''
        },

        wakeUp: function (el,context, next) {
            $super.wakeUp.call(this, el,context, function () {
                this.createEditor();
                next();
            })
        },

        attachEvents: function () {
            var instance = this;
            if (this.createEditor()) {
                this.editor.getSession().on('change', function (e) {
                    instance.value = instance.editor.getValue();
                    instance.trigger('change');
                });
            }
        },

        createEditor: function () {
            if (typeof ace === 'undefined') {
                return false;
            }
            if (typeof this.editor !== 'undefined') {
                return true;
            }

            this.editor = ace.edit(this.mountNode[0]);
            this.editor.$blockScrolling = Infinity;
            this.editor.setValue(this.value || this.getDefaultValue());

            if (this.options.mode) {
                this.editor.getSession().setMode(this.options.mode);
            }
            return true;
        },

        valueDidChange: function (next) {
            if (this.createEditor()) {
                this.editor.setValue(this.value);
                return next();
            }
            next();
        }
    }
});