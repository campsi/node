var deepcopy = require('deepcopy');
var routes = require('./routes');

var saveBtn = {
    tag: 'button',
    attr: {
        class: 'save'
    },
    icon: 'check',
    content: 'save'
};

module.exports = {
    welcome: {
        title: 'Campsi the micro-CMS',
        id: 'welcome',
        contentFile: 'welcome.html',
        leftButtons: [],
        rightButtons: []
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
        leftButtons: [{tag: 'a', attr: {class: 'back', href: routes.projects.path}, content: 'close', icon: 'times'}],
        rightButtons: [
            {tag: 'button', attr: {class: 'delete'}, content: 'delete', icon: 'trash-o'},
            {tag: 'a', attr: {class: 'users', href: routes.projectUsers.path}, content: 'users', icon: 'users'},
            {tag: 'a', attr: {class: 'upload', href: routes.projectUsers.path}, content: 'auto upload', icon: 'cloud-upload'},
            deepcopy(saveBtn)
        ]
    },
    collection: {
        title: 'Collection Detail',
        id: 'collection',
        component: 'campsi/collection',
        leftButtons: [{tag: 'a', attr: {class: 'back', href: routes.project.path}, content: 'close', icon: 'times'}],
        rightButtons: [
            {tag: 'button', attr: {class: 'delete'}, content: 'delete', icon:'trash-o'},
            deepcopy(saveBtn),
            {tag: 'a', attr: {class: 'admin', href: routes.entries.path}, content: 'admin', icon: 'pencil'},
            {tag: 'a', attr: {class: 'design', href: routes.designer.path}, content: 'design', icon: 'cogs'}
        ]
    },
    designer: {
        title: 'Collection Designer',
        id: 'designer',
        component: 'campsi/collection-designer',
        leftButtons: [{tag: 'a', attr: {class: 'back', href: routes.collection.path}, content: 'back', icon: 'angle-left'}],
        rightButtons: [{tag: 'a', attr: {class: 'admin', href: routes.entries.path}, content: 'admin', icon: 'pencil'}, saveBtn]
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
            {tag: 'a', attr: {class: 'back', href: routes.collection.path}, content: 'back', icon: 'angle-left'}
        ],
        rightButtons: [
            deepcopy(saveBtn)
        ],
        componentValue: []
    },
    entry: {
        title: 'Entry Form',
        id: 'entry',
        component: 'campsi/entry',
        leftButtons: [
            {tag: 'a', attr: {class: 'back', href: routes.entries.path}, content: 'back', icon: 'angle-left'},
            {tag: 'a', attr: {class: 'new', href: routes.entries.path}, content: 'new item', icon: 'plus'}
        ],
        rightButtons: [
            deepcopy(saveBtn),
            {tag: 'button', attr: {class: 'delete'}, content: 'delete', icon: 'trash-o'},
            {tag: 'button', attr: {class: 'publish'}, content: 'publish', icon: 'paper-plane'}
        ],
        componentValue: {}
    },
    projectUsers: {
        title: 'Users',
        id: 'projectUsers',
        component: 'campsi/project/users',
        leftButtons: [{tag: 'a', attr: {class: 'close', href: routes.project.path}, content: 'close'}],
        componentValue: {}
    }
};