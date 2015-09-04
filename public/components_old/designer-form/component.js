Campsi.components.extend('collection', function($super){

    return {
        name: 'designer-form',
        defaultOptions: {
            props: {
                withEmptyForm: false,
                placeholder: 'Drag a component here to create a field',
                items: {
                    type: "designer-field"
                }
            }
        },

        createDOM: function(){
            $super.createDOM.call(this);
            this.dom.list.addClass('component-dropzone').data('component', this);
        }

    }
});