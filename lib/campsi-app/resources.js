module.exports = {
    root: {
        url: {
            api: '/api/v1',
            app: '/'
        }
    },
    dashboard: {
        url: {
            app: '/dashboard'
        }
    },
    projects: {
        url: {
            api: ':root/projects',
            app: '/projects'
        }
    },
    components: {
        url: {
            api: ':root/components'
        }
    },
    templates: {
        url: {
            api: ':root/templates'
        }
    },
    project: {
        url: {
            api: ':projects/:project',
            app: ':projects/:project'
        },
        invalidate: ['entriesAndDrafts', 'entry', 'draft', 'projectUsers', 'projectDeployments']
    },
    collection: {
        url: {
            api: ':project/collections/:collection',
            app: ':project/collections/:collection'
        },
        invalidate: ['entriesAndDrafts', 'entry', 'draft']
    },
    entriesAndDrafts: {
        url: {
            api: ':collection/entries-and-drafts'
        }
    },
    collectionAdmin: {
        url: {
            app: ':collection/admin'
        }
    },
    collectionDesign: {
        url: {
            app: ':collection/design'
        }
    },
    fieldProperties: {
        url: {
            app: ':collection/properties/:fieldProperties'
        }
    },
    newEntry: {
        url: {
            app: ':collection/admin/new'
        }
    },
    entry: {
        url: {
            api: ':collection/entries/:entry',
            app: ':collection/entries/:entry'
        }
    },
    draft: {
        url: {
            api: ':collection/drafts/:draft',
            app: ':collection/drafts/:draft'
        }
    },
    projectUsers: {
        url: {
            api: ':project/users',
            app: ':project/users'
        }
    },
    projectGuests: {
        url: {
            api: ':project/guests',
            app: ':project/guests'
        }
    },
    projectDeployments: {
        url: {
            api: ':project/deployments',
            app: ':project/deployments'
        }
    },
    billing: {
        url: {
            api: ':project/billing',
            app: ':project/billing'
        }
    }
};