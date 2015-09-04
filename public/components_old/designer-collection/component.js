Campsi.components.extend('form', function ($super) {


    return {
        name: "designer-collection",

        defaultValue: {
            name: "Untitled collection",
            props: {
                fields: []
            }
        },

        defaultOptions: {
            props: {
                fields: [{
                    name: "name",
                    label: "Collection name",
                    type: "text"
                }, {
                    name: 'props',
                    label: 'Properties',
                    type: 'form',
                    props: {
                        fields: [
                            {
                                name: "fields",
                                type: "designer-form"
                            }
                        ]
                    }

                }]
            }
        }

        /*
         addField: function (options) {
         this.fields['designerFields'].createItemAt(0, options, function () {
         });

         }
         */
    }
});