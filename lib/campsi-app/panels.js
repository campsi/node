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
        leftButtons: [{tag: 'a', attr: {class: 'back', href: 'projects'}, content: 'close', icon: 'times'}],
        rightButtons: [
            {tag: 'button', attr: {class: 'delete'}, content: 'delete', icon: 'trash-o'},
            {tag: 'a', attr: {class: 'users', href: 'projectUsers'}, content: 'users', icon: 'users'},
            {
                tag: 'a',
                attr: {class: 'upload', href: 'projectDeployments'},
                content: 'deployments',
                icon: 'cloud-upload'
            },
            deepcopy(saveBtn)
        ]
    },
    collection: {
        title: 'Collection Detail',
        id: 'collection',
        component: 'campsi/collection',
        componentValue: {},
        leftButtons: [{tag: 'a', attr: {class: 'back', href: 'project'}, content: 'close', icon: 'times'}],
        rightButtons: [
            {tag: 'button', attr: {class: 'delete'}, content: 'delete', icon: 'trash-o'},
            deepcopy(saveBtn),
            {tag: 'a', attr: {class: 'admin', href: 'collectionAdmin'}, content: 'admin', icon: 'pencil'},
            {tag: 'a', attr: {class: 'design', href: 'collectionDesign'}, content: 'design', icon: 'cogs'}
        ]
    },
    designer: {
        title: 'Collection Designer',
        id: 'designer',
        component: 'campsi/collection-designer',
        leftButtons: [{
            tag: 'a',
            attr: {class: 'back', href: 'collection'},
            content: 'back',
            icon: 'angle-left'
        }],
        rightButtons: [{
            tag: 'a',
            attr: {class: 'admin', href: 'collectionAdmin'},
            content: 'admin',
            icon: 'pencil'
        }, saveBtn]
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
        component: 'campsi/entries-and-drafts',
        leftButtons: [
            {tag: 'a', attr: {class: 'back', href: 'collection'}, content: 'back', icon: 'angle-left'}
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
            {tag: 'a', attr: {class: 'back', href: 'collectionAdmin'}, content: 'back', icon: 'angle-left'},
            {tag: 'a', attr: {class: 'new', href: 'collectionAdmin'}, content: 'new item', icon: 'plus'}
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
        leftButtons: [{tag: 'a', attr: {class: 'close', href: 'project'}, content: 'close'}],
        componentValue: {}
    },
    projectDeployments: {
        title: 'Deployments',
        id: 'projectDeployments',
        component: 'campsi/project/deployments',
        leftButtons: [{tag: 'a', attr: {class: 'close', href: 'project'}, content: 'close'}],
        rightButtons: [
            deepcopy(saveBtn)
        ],
        componentValue: {}
    }
};