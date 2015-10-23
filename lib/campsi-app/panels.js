var deepcopy = require('deepcopy');
var routes = require('./routes');

var saveBtn = {
    tag: 'button',
    attr: {
        class: 'save'
    },
    content: 'save'
};

module.exports = {
    welcome: {
        title: 'Campsi the micro-CMS',
        id: 'welcome',
        view: '56294e7db0ead20d15dee532',
        leftButtons: [],
        rightButtons: [{
            tag: 'button',
            attr: {class: 'login'},
            content: 'log in or create account'
        }, {
            tag: 'a',
            attr: {href: '/projects', class: 'hide'},
            content: 'projects'
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
        leftButtons: [{tag: 'a', attr: {class: 'close', href: routes.projects.path}, content: 'close'}],
        rightButtons: [
            {tag: 'button', attr: {class: 'delete'}, content: 'delete'},
            {tag: 'a', attr: {class: 'users', href: routes.projectUsers.path}, content: 'users'},
            {tag: 'a', attr: {class: 'upload', href: routes.projectUsers.path}, content: 'auto upload'},
            deepcopy(saveBtn)
        ]
    },
    collection: {
        title: 'Collection Detail',
        id: 'collection',
        component: 'campsi/collection',
        rightButtons: [
            {tag: 'button', attr: {class: 'delete'}, content: 'delete'},
            deepcopy(saveBtn),
            {tag: 'a', attr: {class: 'admin', href: routes.entries.path}, content: 'admin'},
            {tag: 'a', attr: {class: 'design', href: routes.designer.path}, content: 'design'}
        ]
    },
    designer: {
        title: 'Collection Designer',
        id: 'designer',
        component: 'campsi/collection-designer',
        leftButtons: [{tag: 'a', attr: {class: 'back', href: routes.collection.path}, content: 'back'}],
        rightButtons: [{tag: 'a', attr: {class: 'back', href: routes.entries.path}, content: 'admin'}, saveBtn]
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
            {tag: 'a', attr: {class: 'back', href: routes.collection.path}, content: 'back'}
        ],
        rightButtons: [
            deepcopy(saveBtn)
        ],
        componentValue: {}
    },
    entry: {
        title: 'Entry Form',
        id: 'entry',
        component: 'campsi/entry',
        leftButtons: [
            {tag: 'a', attr: {class: 'back', href: routes.entries.path}, content: 'back'},
            {tag: 'a', attr: {class: 'new', href: routes.entries.path}, content: '+'}
        ],
        rightButtons: [
            deepcopy(saveBtn),
            {tag: 'button', attr: {class: 'remove'}, content: 'delete'},
            {tag: 'button', attr: {class: 'publish'}, content: 'publish'}
        ],
        componentValue: {}
    },
    users: {
        title: 'Users',
        id: 'users',
        component: 'campsi/project/users',
        //leftButtons: [{tag: 'a', attr: {class: 'close', href: routes.project.path}, content: 'close'}],
        componentValue: {}
    }
};