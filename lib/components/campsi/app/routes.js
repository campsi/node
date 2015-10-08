module.exports = {

    welcome: {
        path: '/',
        layout: {
            welcome: ['active', 'w70'],
            projects: ['active', 'w30', 'l70']
        }
    },
    projects: {
        path: '/projects',
        layout: {
            welcome: ['prev'],
            projects: ['active', 'w100']
        }
    },
    project: {
        path: '/projects/:id',
        layout: {
            welcome: ['prev'],
            projects: ['active', 'w30'],
            project: ['active', 'l30', 'w70']
        }
    },
    newProject: {
        path: '/projects/new',
        layout: {
            welcome: ['prev'],
            projects: ['active', 'w30'],
            project: ['active', 'l30', 'w70']
        }
    },
    collection: {
        path: '/projects/:_project/collections/:id',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['active', 'w50'],
            collection: ['active', 'w50', 'l50']
        }
    },
    entries: {
        path: '/collections/:id/admin',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['prev'],
            collection: ['prev'],
            entries: ['active', 'w30'],
            entry: ['active', 'w70', 'l30']
        }
    },
    entry: {
        path: '/collections/:collectionId/:entryId',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['prev'],
            collection: ['prev'],
            entries: ['active', 'w30'],
            entry: ['active', 'w70', 'l30']
        }
    },
    designer: {
        path: '/collections/:id/design',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['prev'],
            collection: ['prev'],
            designer: ['active', 'w70'],
            components: ['active', 'w70', 'l70']
        }
    }
};