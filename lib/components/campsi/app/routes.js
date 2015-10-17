module.exports = {

    welcome: {
        path: '/',
        layout: {
            welcome: ['w70'],
            projects: ['w30', 'l70']
        }
    },
    projects: {
        path: '/projects',
        layout: {
            welcome: ['prev'],
            projects: ['w100']
        }
    },
    project: {
        path: '/projects/:project',
        layout: {
            welcome: ['prev'],
            projects: ['w30'],
            project: ['l30', 'w70']
        }
    },
    projectUsers: {
        path: '/projects/:project/users',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['w50'],
            users: ['l50', 'w50']
        }
    },
    newProject: {
        path: '/projects/new',
        layout: {
            welcome: ['prev'],
            projects: ['w30'],
            project: ['l30', 'w70']
        }
    },
    collection: {
        path: '/projects/:project/collections/:collection',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['w50'],
            collection: ['w50', 'l50']
        }
    },
    entries: {
        path: '/projects/:project/collections/:collection/admin',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['prev'],
            collection: ['prev'],
            entries: ['w30'],
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
            entry: ['w70', 'l30']
        }
    },
    designer: {
        path: '/projects/:project/collections/:collection/design',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['prev'],
            collection: ['prev'],
            designer: ['w70'],
            components: ['w30', 'l70']
        }
    }
};