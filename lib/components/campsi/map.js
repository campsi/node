var Campsi = require('campsi');

require('./collection/component');
require('./collection-designer/component');
require('./collection-designer/field/component');
require('./collection-list/component');
require('./collection-list/wizard/component');
require('./collection-list/collection/component');
require('./component-chooser/component');
require('./component-chooser/component-options/component');
require('./component-list/component');
require('./entries/component');
require('./entry/component');
require('./entry-list/component');
require('./entry-list/entry/component');
require('./panel/component');
require('./project/component');
require('./project/users/component');
require('./project/users/user/component');
require('./project-list/project/component');

console.info("campsi components finished loading", Campsi.getLoadedComponents());

if (window.onCampsiComponentsReady) {
    window.onCampsiComponentsReady();
}