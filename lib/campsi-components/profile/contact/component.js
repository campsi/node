'use strict';
var Campsi = require('campsi-core');
module.exports = Campsi.extend('form', 'campsi/profile/contact', function () {
    return {
        getDefaultOptions: function () {
            var t = this.context.translate.bind(this.context);
            return {
                fields: [
                    {
                        type: 'text',
                        name: 'email',
                        placeholder: t('component.profile.contact.email.placeholder')
                    },
                    {
                        type: 'text',
                        name: 'fullname',
                        placeholder: t('component.profile.contact.fullname.placeholder')
                    },
                    {
                        type: 'file/image',
                        name: 'avatar',
                        label: t('component.profile.contact.avatar.placeholder')
                    },
                    {
                        type: 'select/dropdown',
                        name: 'locale',
                        label: t('component.profile.contact.locale.label'),
                        options: [
                            {
                                value: 'fr',
                                label: t('component.profile.contact.locale.fr')
                            },
                            {
                                value: 'en',
                                label: t('component.profile.contact.locale.en')
                            }
                        ]
                    },
                    {
                        type: 'checkbox',
                        name: 'newsletterSubscribe',
                        label: t('component.profile.contact.newsletter.label'),
                        checkboxText: t('component.profile.contact.newsletter.checkboxText')
                    },
                    {
                        type: 'checkbox',
                        name: 'showDemoProjects',
                        label: t('component.profile.contact.showDemoProjects.label'),
                        checkboxText: t('component.profile.contact.showDemoProjects.checkboxText')
                    }
                ]
            };
        }
    };
});