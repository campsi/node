'use strict';

var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var isBrowser = require('is-browser');
var deepCopy = require('deepcopy');
module.exports = Campsi.extend('component', 'campsi/publish/facebook/feed-chooser', function ($super) {

    return {

        getDefaultValue: function () {
            return {};
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.createButtons();
                instance.mountNode.append('<div class="chooser"></div>');
                next();
            });
        },

        createButtons: function () {
            var instance = this;
            var $buttons = $('<div class="buttons">');
            $buttons.append('<button class="profile" data-value="profile">Profile</button>');
            $buttons.append('<button class="group" data-value="group">Group</button>');
            $buttons.append('<button class="page" data-value="page">Page</button>');
            $buttons.append('<button class="event" data-value="event">Event</button>');

            instance.mountNode.append($buttons);
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                next();
            })
        },

        attachEvents: function () {

            var instance = this;

            if (!isBrowser) {
                return;
            }

            if (typeof window.fbAsyncInit === 'undefined') {
                window.fbAsyncInit = function () {
                    window.FB.init({
                        appId: '990986140961761',
                        xfbml: true,
                        version: 'v2.6'
                    });
                    instance.loadPictures();
                    if (instance.value.type) {
                        instance.selectFeedType(instance.value.type);
                    }
                };

                (function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) {
                        return;
                    }
                    js = d.createElement(s);
                    js.id = id;
                    js.src = "//connect.facebook.net/en_US/sdk.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));
            }

            instance.mountNode.on('click', 'button', function () {
                instance.mountNode.find('button').removeClass('pressed');
                var nextValue = deepCopy(instance.value);
                nextValue.type = $(this).attr('data-value');
                instance.setValue(nextValue);
            });

            instance.mountNode.on('change', '.chooser input', function () {

                var $input = $(this);
                var nextValue = deepCopy(instance.value);
                nextValue.access_token = $input.val();
                nextValue.id = $input.attr('data-id');
                instance.setValue(nextValue, function () {
                    instance.mountNode.find('.chooser label').removeClass('checked');
                    $input.closest('label').addClass('checked');
                });
            });

        },

        loadPictures: function () {
            this.mountNode.find('img[data-id]').each(function (i, img) {
                var $img = $(img);
                FB.api('/' + $img.attr('data-id') + '/picture', function (response) {
                    $img.attr('src', response.data.url);
                });
            });
        },

        selectFeedType: function (type) {

            this.mountNode.find('.buttons [data-value=' + type + ']').addClass('pressed');
            switch (type) {
                case 'page':
                    this.pageFeedSelected();
                    break;
                case 'group':
                    this.groupFeedSelected();
                    break;
                case 'profile':
                    this.profileFeedSelected();
                    break;
                case 'event':
                    this.eventFeedSelected();
                    break;
            }
        },

        selectFeed: function (id) {
            var $input = this.mountNode.find('input[data-id=' + id + ']');
            $input.attr('checked', true);
            $input.closest('label').addClass('checked');
        },

        groupFeedSelected: function () {
            var instance = this;
            var $chooser = instance.mountNode.find('.chooser').empty();

        },

        profileFeedSelected: function () {
            var instance = this;
            var $chooser = instance.mountNode.find('.chooser').empty();

        },

        eventFeedSelected: function () {
            var instance = this;
            var $chooser = instance.mountNode.find('.chooser').empty();
        },


        pageFeedSelected: function () {
            var instance = this;
            var $chooser = instance.mountNode.find('.chooser').empty();

            if (!isBrowser || typeof window.FB === 'undefined') {
                return;
            }

            // refactor

            FB.login(function (authResponse) {
                if (authResponse.status === 'connected' && authResponse.authResponse.grantedScopes.indexOf('manage_pages') > -1) {
                    console.info("FB.login", authResponse, {
                        access_token: authResponse.authResponse.access_token
                    });
                    $.ajax({
                        method: 'POST',
                        url: '/utils/facebook/user-access-token',
                        data: JSON.stringify({
                            access_token: authResponse.authResponse.accessToken
                        }),
                        dataType: 'json',
                        contentType: 'application/json; charset=UTF-8'
                    }).done(function (longLifeUserToken) {
                        FB.api('/me/accounts', function (accountsResponse) {
                            accountsResponse.data.forEach(function (account) {
                                var $label = $('<label><input type="radio"><img><div class="identity"><span class="name"></span><span class="category"></span></div></label>');
                                $label.find('input').attr({
                                    value: account.access_token,
                                    name: instance.id,
                                    'data-id': account.id
                                });
                                $label.find('.name').text(account.name);
                                $label.find('.category').text(account.category);
                                $label.find('img').attr('data-id', account.id);
                                $chooser.append($label);
                            });
                            instance.loadPictures();
                            if (instance.value.id) {
                                instance.selectFeed(instance.value.id);
                            }
                        }, {
                            scope: 'manage_pages',
                            access_token: longLifeUserToken.access_token
                        });
                    });
                }
            }, {
                scope: 'manage_pages,publish_actions,publish_pages',
                return_scopes: true
            });

        },

        getNodePaths: function () {
            return {};
        },

        optionsDidChange: function (next) {
            next();
        },

        valueDidChange: function (next) {
            var instance = this;
            if (instance.value.type && instance.value.type !== instance.getPreviousValue().type) {
                instance.selectFeedType(instance.value.type);
            }
            if (instance.value.id && instance.value.id !== instance.getPreviousValue().id) {
                instance.selectFeed(instance.value.id);
            }
            next();
        }
    }
});