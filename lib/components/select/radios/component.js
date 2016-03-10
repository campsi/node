var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('select/dropdown', 'select/radios', function ($super) {
    return {
        getTagName: function () {
            return 'div';
        },

        getDefaultOptions: function(){
            return {
                createEmptyOption: false,
                options: []
            }
        },

        wakeUp: function(el,context, next){
            var instance = this;
            $super.wakeUp.call(this, el, context, function(){
                instance.inputs = $(this.mountNode.find('input'));
                next();
            })
        },

        attachEvents: function () {
            var instance = this;
            $(this.inputs).on('change', function (e) {
                instance.setValue($(e.target).val());
            });
        },

        createOption: function(value, label){
            var $el = $('<label>');
            var $input = $('<input type="radio">').attr('name', this.id).attr('value', value);
            $el.append($input);
            $el.append($('<span>').text(label));
            this.inputs = this.inputs || [];
            this.inputs.push($input);
            return $el;
        },

        valueDidChange: function(next){
            var v = this.value;
            $(this.inputs).each(function(){
                if ($(this).attr('value').toString() === v){
                    $(this).attr('checked', true);
                }
            });
            next();
        }
    }
});