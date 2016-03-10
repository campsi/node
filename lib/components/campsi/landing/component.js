var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/landing', function () {
    return {
        attachEvents: function () {
            var instance = this;
            $(window).on('hashchange', function () {
                instance.placeSections(window.location.hash.substring(1) || 'hi');
            });
        },

        getNodePaths: function () {
            return {
                sections: 'section'
            }
        },

        placeSections: function (section) {
            var found = false;

            if(section === 'login'){
                return;
            }

            this.nodes.sections.each(function () {
                if ($(this).attr('id') === section + '_section') {
                    $(this).removeClass('prev next').addClass('active');
                    found = true;
                } else {
                    if (found) {
                        $(this).removeClass('prev active').addClass('next');
                    } else {
                        $(this).removeClass('next active').addClass('prev');
                    }
                }
            });
        },

        valueDidChange: function (next) {
            this.mountNode.empty();
            this.mountNode.html(this.value);
            this.nodes.sections = this.mountNode.find('section');
            next();
        },
        serializeValue: function () {

        },
        serializeOptions: function () {

        }
    }
});