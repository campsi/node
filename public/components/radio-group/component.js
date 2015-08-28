Campsi.components.add(function($super){

    return {
        name: 'radio-group',

        createDOM: function(){
            var instance = this;
            var id = 'radio-group-' + Math.random();

            $(instance.options.props.values).each(function(i, valueNode){
                instance.createOption(valueNode, id);
            });
        },

        createOption: function(item, id){
            var $label = $('<label>');
            var $input = $('<input type="radio">');
            var instance = this;
            $input.attr('name', id).attr('value', item.value);

            $input.on('change', function(){
                instance.value = $(this).val();
                instance.trigger('change');
            });

            $label.append($input).append(item.label);

            this.dom.control.append($label);
        },

        getDesignerFields: function(){
            return [{
                type: 'collections'
            }];
        }



    }
});