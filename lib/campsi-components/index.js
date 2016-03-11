var isBrowser = require('is-browser');

exports = module.exports = {
    'campsi/billing': require('./billing/component'),
    'campsi/collection': require('./collection/component'),
    'campsi/collection/api-doc': require('./collection/api-doc/component'),
    'campsi/collection/field-properties': require('./collection/field-properties/component'),
    'campsi/collection/intro': require('./collection/intro/component'),
    'campsi/collection-designer/field': require('./collection-designer/field/component'),
    'campsi/collection-designer/components': require('./collection-designer/components/component'),
    'campsi/collection-list': require('./collection-list/component'),
    'campsi/collection-list/wizard': require('./collection-list/wizard/component'),
    'campsi/collection-list/collection': require('./collection-list/collection/component'),
    'campsi/dashboard': require('./dashboard/component'),
    'campsi/dashboard/widget': require('./dashboard/widget/component'),
    'campsi/dashboard/widget/activity': require('./dashboard/widget/activity/component'),
    'campsi/dashboard/widget/favorites': require('./dashboard/widget/favorites/component'),
    'campsi/dashboard/widget/news': require('./dashboard/widget/news/component'),
    'campsi/dashboard/widget/profile': require('./dashboard/widget/profile/component'),
    'campsi/component-chooser': require('./component-chooser/component'),
    'campsi/component-list': require('./component-list/component'),
    'campsi/entries-and-drafts': require('./entries-and-drafts/component'),
    'campsi/entries-and-drafts/item': require('./entries-and-drafts/item/component'),
    'campsi/entry': require('./entry/component'),
    'campsi/panel': require('./panel/component'),
    'campsi/profile/contact': require('./profile/contact/component'),
    'campsi/project': require('./project/component'),
    'campsi/project/intro': require('./project/intro/component'),
    'campsi/project/deployments': require('./project/deployments/component'),
    'campsi/project/users': require('./project/users/component'),
    'campsi/project/users/user': require('./project/users/user/component'),
    'campsi/project-list/project': require('./project-list/project/component'),
    'campsi/project-list': require('./project-list/component'),
    'campsi/landing': require('./landing/component'),
    'campsi/projects': require('./projects/component'),
    'campsi/help-tour-step': require('./help-tour-step/component')
};

if (isBrowser && window.onCampsiComponentsReady) {
    window.onCampsiComponentsReady();
}