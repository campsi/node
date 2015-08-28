Campsi.components.extend('form', function ($super) {


    return {
        name: "designer-collection",

        defaultValue: {
            name: "Untitled collection",
            fields: []
        },

        defaultOptions: {
            props: {
                fields: [{
                    name: "name",
                    label: "Collection name",
                    type: "text"
                },{
                    name: "fieldsToDisplayInAdminTable",
                    label: "Fields to display in admin table",
                    type: "collection",
                    props: {
                        items: {
                            type: "text",
                            name: "name"
                        },
                        withEmptyField: true
                    }
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