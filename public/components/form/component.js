Campsi.components.add(function ($super) {
    return {

        name: 'form',

        style: ['style.css'],

        defaultValue: {},


        createDOM: function () {

            this.dom.root.addClass('form');
            this.dom.fields = {};
            this._fields = {};
            this._fieldsCreated = 0;

            if (this.options.props && this.options.props.fields) {
                this.createFields();
            } else {
                console.info('none', this.dom.root[0] )
            }
        },

        createFields: function () {
            var instance = this, props = this.options.props;
            $(props.fields).each(function (i, fieldOptions) {
                instance.createField(fieldOptions);
            });
        },

        createField: function (fieldOptions) {
            var instance = this;

            Campsi.components.create(
                fieldOptions,
                instance.value[fieldOptions.name],
                instance.context,
                function (field) {
                    field.on('change', function () {
                        instance.value[fieldOptions.name] = field.val();
                        instance.trigger('change');
                        if (field.errors.length == 0) {
                            instance.dom.root.removeClass('error');
                        }
                    });

                    field.on('error', function () {
                        instance.error = true;
                        instance.dom.root.addClass('error');
                        instance.trigger('error');
                    });

                    instance._fields[fieldOptions.name] = field;
                    instance._fieldsCreated++;

                    if (instance._fieldsCreated === instance.options.props.fields.length) {

                        $(instance.options.props.fields).each(function (i, f) {
                            instance.dom.fields[f.name] = instance._fields[f.name].html();
                            instance.dom.control.append(instance.dom.fields[f.name]);
                        });

                        instance.allFieldsCreated();
                    }
                }
            );
        },

        allFieldsCreated: function () {

        },

        getDesignerFields: function () {
            return [
                {
                    type: "designer-form",
                    name: "fields",
                    label: "Fields"
                }
            ];
        },

        update: function () {
            var value = this.value;

            $.each(this._fields, function (fieldName, field) {
                field.val(value[fieldName]);
            });
        },

        validate: function () {

        }
    }
})
;