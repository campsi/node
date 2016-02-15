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
            projectUsers: ['l70', 'w30', 'main']
        }
    },
    projectDeployments: {
        path: '/projects/:project/deployments',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['w70'],
            projectDeployments: ['l70', 'w30', 'main']
        }
    },
    billing: {
        path: '/projects/:project/billing',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['w70'],
            billing: ['l70', 'w30', 'main']
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
    newCollection: {
        path: '/projects/:project/collections/new',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['w50'],
            collection: ['w50', 'l50', 'main']
        }
    },
    collection: {
        path: '/projects/:project/collections/:collection',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['prev'],
            collection: ['w70', 'main'],
            components: ['w30', 'l70']
        }
    },
    entries: {
        path: '/projects/:project/collections/:collection/admin',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['prev'],
            collection: ['prev'],
            entries: ['w50', 'main'],
            entry: ['w50', 'l50']
        }
    },
    newEntry: {
        path: '/projects/:project/collections/:collection/new',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['prev'],
            collection: ['prev'],
            entries: ['w50'],
            entry: ['w50', 'l50', 'main']
        }
    },
    entry: {
        path: '/projects/:project/collections/:collection/entries/:entry',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['prev'],
            collection: ['prev'],
            entries: ['w50'],
            entry: ['w50', 'l50', 'main']
        }
    },
    draft: {
        path: '/projects/:project/collections/:collection/drafts/:draft',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['prev'],
            collection: ['prev'],
            entries: ['w50'],
            entry: ['w50', 'l50', 'main']
        }
    }
};