Campsi.components.extend('select', function ($super) {

    return {

        name: 'ajax-select',

        init: function () {
            $super.init.apply(this, arguments);
        },

        createDOM: function(){
            $super.createDOM.apply(this, arguments);
            this.dom.root.addClass('ajax-select');
            this.dom.control.append($('<img>').attr('src', 'src/ajax-select/ajax-loader.gif'));
        },

        createOptions: function () {

            var instance = this, props = this.options.props, select = this.dom.select;

            $.getJSON(props.url, function (data) {
                $(data).each(function (i, row) {
                    select.append(instance.createOption(row));
                });
                instance.dom.control.find('img').remove();
                instance.update();
            });

        },
        getDesignerFields:function() {
            return [{
                type: 'text',
                name: 'url',
                label: 'URL'
            },{
                type: 'text',
                name: 'labelField',
                label: 'Label field'
            },{
                type: 'text',
                name: 'valueField',
                label: 'Value field'
            }];
        }

    }
});