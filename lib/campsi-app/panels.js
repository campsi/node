var deepcopy = require('deepcopy');

var saveBtn = function (ctx) {
    return {
        tag: 'button',
        attr: {
            class: 'save'
        },
        icon: 'check',
        content: ctx.translate('btns.save')
    }
};

module.exports = function (ctx) {

    return {
        welcome: {
            title: '',
            id: 'welcome',
            component: 'campsi/landing',
            leftButtons: [],
            rightButtons: []
        },
        dashboard: {
            title: 'Dashboard',
            id: 'dashboard',
            component: 'campsi/dashboard',
            leftButtons: [{
                tag: 'a', attr: {class: 'welcome', href: 'root'}, content: ctx.translate('btns.home'), icon: 'list'
            }],
            rightButtons: [{
                tag: 'button', attr: {class: 'logout'}, content: ctx.translate('btns.logout'), icon: 'sign-out'
            }, {
                tag: 'a', attr: {class: 'projects', href: 'projects'}, content: ctx.translate('btns.projects'), icon: 'list'
            }]
        },
        projects: {
            title: ctx.translate('panels.projects.header.title'),
            id: 'projects',
            component: 'campsi/projects',
            theme: 'dark',
            leftButtons: [{
                tag: 'a', attr: {class: 'back', href: 'dashboard'}, content: ctx.translate('btns.back'), icon: 'angle-left'
            }]
        },
        project: {
            title: ctx.translate('panels.project.header.title'),
            id: 'project',
            component: 'campsi/project',
            leftButtons: [{
                tag: 'a',
                attr: {class: 'back', href: 'projects'},
                content: ctx.translate('btns.back'),
                icon: 'times'
            }],
            rightButtons: [
                {tag: 'button', attr: {class: 'delete'}, content: ctx.translate('btns.delete'), icon: 'trash-o'},
                {
                    tag: 'a',
                    attr: {class: 'users', href: 'projectUsers'},
                    content: ctx.translate('btns.projectUsers'),
                    icon: 'users'
                },
                {
                    tag: 'a',
                    attr: {class: 'upload', href: 'projectDeployments'},
                    content: ctx.translate('btns.projectDeployments'),
                    icon: 'cloud-upload'
                },
                {
                    tag: 'a',
                    attr: {class: 'billing', href: 'billing'},
                    content: ctx.translate('btns.billing'),
                    icon: 'eur'
                },
                deepcopy(saveBtn(ctx))
            ]
        },
        collection: {
            title: ctx.translate('panels.collection.header.title'),
            id: 'collection',
            component: 'campsi/collection',
            componentValue: {},
            leftButtons: [{tag: 'a', attr: {class: 'back', href: 'project'}, content: ctx.translate('btns.back'), icon: 'times'}],
            rightButtons: [
                {tag: 'button', attr: {class: 'delete'}, content: ctx.translate('btns.delete'), icon: 'trash-o'},
                deepcopy(saveBtn(ctx)),
                {
                    tag: 'a',
                    attr: {class: 'admin', href: 'collectionAdmin'},
                    content: ctx.translate('btns.admin'),
                    icon: 'pencil'
                }
            ]
        },
        fieldProperties: {
            title: ctx.translate('panels.fieldProperties.header.title'),
            id: 'fieldProperties',
            component: 'campsi/collection/field-properties',
            componentValue: {},
            theme: 'dark',
            leftButtons: [{tag: 'a', attr: {class: 'close', href: 'collection'}, content: ctx.translate('btns.close'), icon: 'times'}],
            rightButtons: []
        },
        components: {
            title: ctx.translate('panels.components.header.title'),
            id: 'components',
            theme: 'dark',
            component: 'campsi/collection-designer/components',
            leftButtons: []
        },
        entries: {
            title: ctx.translate('panels.entries.header.title'),
            id: 'entries',
            component: 'campsi/entries-and-drafts',
            theme: 'dark',
            leftButtons: [
                {
                    tag: 'a',
                    attr: {class: 'back', href: 'project'},
                    content: ctx.translate('btns.back'),
                    icon: 'angle-left'
                }
            ],
            rightButtons: [
                deepcopy(saveBtn(ctx)),
                {
                    tag: 'a',
                    attr: {class: 'new', href: 'newEntry'},
                    content: ctx.translate('btns.newEntry'),
                    icon: 'plus'
                }
            ],
            componentValue: {drafts: [], entries: []}
        },
        entry: {
            title: ctx.translate('panels.entry.header.title'),
            id: 'entry',
            component: 'campsi/entry',
            leftButtons: [
                {
                    tag: 'a',
                    attr: {class: 'back', href: 'collectionAdmin'},
                    content: ctx.translate('btns.back'),
                    icon: 'angle-left'
                }
            ],
            rightButtons: [
                deepcopy(saveBtn(ctx)),
                {tag: 'button', attr: {class: 'publish'}, content: ctx.translate('btns.publish'), icon: 'paper-plane'},
                {tag: 'button', attr: {class: 'delete'}, content: ctx.translate('btns.delete'), icon: 'trash-o'}
            ],
            componentValue: {}
        },
        projectUsers: {
            title: ctx.translate('panels.projectUsers.header.title'),
            id: 'projectUsers',
            component: 'campsi/project/users',
            theme: 'dark',
            leftButtons: [{tag: 'a', attr: {class: 'close', href: 'project'}, content: ctx.translate('btns.close')}],
            componentValue: {}
        },
        projectDeployments: {
            title: ctx.translate('panels.projectDeployments.header.title'),
            id: 'projectDeployments',
            component: 'campsi/project/deployments',
            theme: 'dark',
            leftButtons: [{tag: 'a', attr: {class: 'close', href: 'project'}, content: ctx.translate('btns.close')}],
            rightButtons: [
                deepcopy(saveBtn(ctx))
            ],
            componentValue: {}
        },
        billing: {
            title: ctx.translate('panels.billing.header.title'),
            id: 'billing',
            component: 'campsi/billing',
            theme: 'dark',
            leftButtons: [{tag: 'a', attr: {class: 'close', href: 'project'}, content: ctx.translate('btns.close')}],
            componentValue: {}
        }
    }
};