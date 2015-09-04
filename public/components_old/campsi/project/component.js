Campsi.components.extend('form', function ($super) {

    return {
        name: 'campsi/project',

        defaultOptions: {
            props: {
                fields: [{
                    name:    'name',
                    label:   'Project name',
                    type:    'text',
                    additionalClasses: ['invisible', 'project-name']
                }, {
                    label: 'Admins',
                    name:  'admins',
                    type:  'campsi/user-list'
                }, {
                    label: 'Designers',
                    name:  'designers',
                    type:  'campsi/user-list'
                }, {
                    label: 'Collections',
                    name:  'collections',
                    type:  'campsi/collection-list'
                }]
            }
        },

        selectedCollection: null,

        allFieldsCreated: function(){
            //todo il faut rendre ce putain de createDOM async
            var instance = this;
            this._fields.collections.on('select', function(){
                instance.selectedCollection = this.selected;
                instance.trigger('collectionSelected');
            });
        }
    }
});