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
        }
    }
});