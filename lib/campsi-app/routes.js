module.exports = {

    welcome: {
        path: '/',
        layout: {
            welcome: ['w80', 'main'],
            projects: ['w20', 'l80']
        }
    },
    projects: {
        path: '/projects',
        layout: {
            welcome: ['prev'],
            projects: ['w100', 'main']
        }
    },
    project: {
        path: '/projects/:project',
        layout: {
            welcome: ['prev'],
            projects: ['w30'],
            project: ['l30', 'w70', 'main']
        }
    },
    projectUsers: {
        path: '/projects/:project/users',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['w70'],
            users: ['l70', 'w30', 'main']
        }
    },
    newProject: {
        path: '/projects/new',
        layout: {
            welcome: ['prev'],
            projects: ['w30'],
            project: ['l30', 'w70', 'main']
        }
    },
    collection: {
        path: '/projects/:project/collections/:collection',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['w50'],
            collection: ['w50', 'l50', 'main']
        }
    },
    entries: {
        path: '/projects/:project/collections/:collection/admin',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['prev'],
            collection: ['prev'],
            entries: ['w30', 'main'],
            entry: ['w70', 'l30']
        }
    },
    entry: {
        path: '/projects/:project/collections/:collection/:entry',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['prev'],
            collection: ['prev'],
            entries: ['w30'],
            entry: ['w70', 'l30', 'main']
        }
    },
    designer: {
        path: '/projects/:project/collections/:collection/design',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['prev'],
            collection: ['prev'],
            designer: ['w70', 'main'],
            components: ['w30', 'l70']
        }
    }
};