Campsi.components.add(function ($super) {

    return {
        name:      'checkbox',
        withLabel: false,

        createDOM: function () {

            this.dom.root.addClass("checkbox");

            this.dom.label    = $('<label>').text(options.label);
            this.dom.checkbox = $('<input type="checkbox">');
            this.dom.control.append(this.dom.label.prepend(this.dom.checkbox));
            this.update();
        },

        attachEvents: function(){
            var instance = this;

            this.dom.checkbox.on('change', function () {
                instance.value = $(this).is(':checked');
                instance.trigger('change');
            });
        },

        update: function () {
            this.dom.checkbox.attr('checked', this.value);
        }
    }
});