//module.exports = function(Campsi, $super){
Campsi.components.add(function ($super) {
    return {

        name: 'text',
        style: ['style.css'],

        createDOM: function () {
            this.dom.root.addClass('text');

            var input = this.dom.input = $('<input type="text">');

            if (this.options.placeholder) {
                input.attr('placeholder');
            }

            this.dom.control.append(input);
        },

        attachEvents: function () {
            var instance = this, input = this.dom.input;
            input.on('change', function (event) {
                instance.val(event.target.value);
                instance.trigger('change');
            });

        },

        update: function () {
            if (this.dom) {
                this.dom.input.val(this.value);
            }
        },

        validate: function (value) {
            $super.validate.call(this, value);

            var props = this.options.props || {};

            if (props['beginsWith']) {
                this.addError((value.indexOf(props['beginsWith']) !== 0), 'value must begins with ' + props['beginsWith'])
            }
        },

        getPropsFormFields: function () {
            return $super.getPropsFormFields().concat([
                {
                    name: 'beginsWith',
                    type: 'text',
                    label: 'Begins with'
                }
            ]);
        }
    }
});
//};
