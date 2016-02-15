require('./collection/component');
require('./collection-designer/component');
require('./collection-designer/field/component');
require('./collection-designer/components/component');
require('./collection-list/component');
require('./collection-list/wizard/component');
require('./collection-list/collection/component');
require('./component-chooser/component');
require('./component-list/component');
require('./entries-and-drafts/component');
require('./entry/component');
require('./panel/component');
require('./project/component');
require('./project/deployments/component');
require('./project/users/component');
require('./project/users/user/component');
require('./project-list/project/component');
require('./project-list/component');
require('./landing/component');
require('./projects/component');
require('./help-tour-step/component');


if (window.onCampsiComponentsReady) {
    window.onCampsiComponentsReady();
}