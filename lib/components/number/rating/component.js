var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'number/rating', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                scale: 5,
                shape: '★'
            }
        },

        getDesignerFormOptions: function () {
            var superOptions = $super.getDesignerFormOptions.call(this);

            superOptions.fields = superOptions.fields.concat([{
                name: 'scale',
                label: 'scale',
                type: 'number'
            }, {
                name: 'shape',
                label: 'shape',
                type: 'select/dropdown',
                options: [{
                    value: '★',
                    label: 'star'
                }, {
                    value: '❤',
                    label: 'heart'
                }]
            }]);
            return superOptions;
        },

        attachEvents: function () {
            var instance = this;
            this.mountNode.on('click', 'span', function () {
                var $span = $(this);
                instance.setValue($span.index());
            }).on('mouseover', 'span', function () {
                var index = $(this).index();
                instance.mountNode.find('span').each(function (i, span) {
                    $(span).toggleClass('hover', (i <= index))
                });
            }).on('mouseout', 'span', function () {
                instance.mountNode.find('span').removeClass('hover');
            });
        },

        optionsDidChange: function (next) {
            this.mountNode.empty();
            var i = 0;
            for (; i < this.options.scale; i++) {
                this.mountNode.append($('<span>').text(this.options.shape));
            }

            next();
        },

        valueDidChange: function (next) {
            var v = this.value;
            this.mountNode.find('span').each(function (i, span) {
                $(span).toggleClass('checked', (i <= Math.ceil(v)));
            });
            next();
        }
    }
});