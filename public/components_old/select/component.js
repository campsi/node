Campsi.components.add(function ($super) {

    return {

        name: 'select',

        style: ['style.css'],

        createDOM: function () {
            var select = this.dom.select = $('<select>');
            this.dom.root.addClass('select');
            this.dom.control.append(select);
        },

        attachEvents: function () {
            var instance = this, select = this.dom.select;
            select.on('change', function () {
                instance.value = $(this).val();
                instance.trigger('change');
            });

        },

        createOptions: function () {
            var instance = this,
                values   = this.options.props.values,
                select   = this.dom.select;

            $(values).each(function () {
                select.append(instance.createOption(this));
            });

            instance.update();

        },
        update:        function () {
            this.dom.select.val(this.value);
        },

        createOption: function (optionData) {
            var option = $('<option>'), props = this.options.props;
            option.text(optionData[props.labelField]);
            option.attr('value', optionData[props.valueField]);
            return option;
        },

        html: function () {
            if (!this['optionsCreated']) {
                this.createOptions();
                this.optionsCreated = true;
            }

            return $super.html.call(this);
        },

        getDesignerFields: function () {
            return [{
                name:  "values",
                type:  "collection",
                label: "Values",
                props: {
                    items: {
                        type:  "form",
                        props: {
                            fields: [{
                                name:   "value",
                                label:  "Value",
                                type:   "text",
                                layout: "horizontal"
                            }, {
                                name:   "label",
                                label:  "Label",
                                type:   "text",
                                layout: "horizontal"
                            }]
                        }
                    }

                }
            }]
        }

    }
});