var deepcopy = require('deepcopy');

var saveBtn = {
    tag: 'button',
    attr: {
        class: 'save'
    },
    content: 'save'
};

module.exports = {
    welcome: {
        title: 'Welcome',
        id: 'welcome',
        leftButtons: [],
        rightButtons: [{
            tag: 'a',
            attr: {href: '/projects', class: 'hide'},
            content: 'hide'
        }]
    },
    projects: {
        title: 'My Projects',
        id: 'projects',
        component: 'campsi/project-list'
    },
    project: {
        title: 'Project Detail',
        id: 'project',
        component: 'campsi/project',
        leftButtons: [{tag: 'a', attr: {class: 'close', href: '/projects'}, content: 'close'}],
        rightButtons: [deepcopy(saveBtn)]
    },
    collection: {
        title: 'Collection Detail',
        id: 'collection',
        component: 'campsi/collection',
        rightButtons: [
            deepcopy(saveBtn),
            {tag: 'a', attr: {class: 'admin', href: '/collections/:id/admin'}, content: 'admin'},
            {tag: 'a', attr: {class: 'design', href: '/collections/:id/design'}, content: 'design'}
        ]
    },
    designer: {
        title: 'Collection Designer',
        id: 'designer',
        component: 'campsi/collection-designer',
        leftButtons: [{tag: 'a', attr: {class: 'back', href: '/projects/:_project/collections/:id'}, content: 'back'}],
        rightButtons: [saveBtn]
    },
    components: {
        title: 'Components',
        id: 'components',
        component: 'campsi/collection-designer/components',
        leftButtons: []
    },
    entries: {
        title: 'Entries',
        id: 'entries',
        component: 'campsi/entries',
        leftButtons: [
            {tag: 'a', attr: {class: 'back', href: '/projects/:projectId/collections/:collectionId'}, content: 'back'}
        ],
        rightButtons: [
            {tag: 'a', attr: {class: 'new', href: '/collections/:id/admin'}, content: 'new entry'}
        ],
        componentValue: {}
    },
    entry: {
        title: 'Entry Form',
        id: 'entry',
        component: 'campsi/entry',
        leftButtons: [],
        rightButtons: [
            deepcopy(saveBtn),
            {tag: 'button', attr: {class: 'remove'}, content: 'delete'},
            {tag: 'button', attr: {class: 'publish'}, content: 'publish'}
        ],
        componentValue: {}
    }
};