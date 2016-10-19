'use strict';
var Context = require('./context');
var Resource = require('./resource');
var async = require('async');
module.exports = function (serialized) {
    var app = new Context(serialized);
    app.setResources({
        projects: new Resource('api/v1/projects', {
            project: new Resource('/:project', {
                collections: new Resource('/collections', {
                    collection: new Resource('/:collection', {
                        fieldName: new Resource('/properties/:fieldName'),
                        entries: new Resource('/entries'),
                        entriesAndDrafts: new Resource('/entries-and-drafts'),
                        entry: new Resource('/entries/:entry'),
                        draft: new Resource('/drafts/:draft')
                    })
                }),
                projectUsers: new Resource('/users'),
                projectGuests: new Resource('/guests'),
                projectBilling: new Resource('/billing')
            })
        }),
        components: new Resource('api/v1/components'),
        templates: new Resource('api/v1/templates', {template: new Resource('/:template')}),
        me: new Resource('api/v1/users/me')
    });

    var userIsSingleProjectAdmin = (
        app.user
        && app.user.projects.length === 1
        && app.user.projects[0].roles.length === 1
        && app.user.projects[0].roles[0] === 'admin'
    );

    // Warning : dynamic requires break browserify build
    //if(userIsSingleProjectAdmin){
    //    console.info("ADMIN");
    //    require('./roles/admin')(app);
    //} else {
    require('./roles/designer')(app);
    //}
    return app;
};