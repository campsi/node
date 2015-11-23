var Campsi = require('campsi');
var extend = require('extend');
var deepCopy = require('deepcopy');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/collection-designer', function ($super) {

    return {

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                Campsi.create('campsi/component-list', {context: instance.context}, function (componentList) {
                    instance.componentList = componentList;
                    instance.mountNode.append(instance.componentList.render());

                    Campsi.create('form', {
                        context: instance.context,
                        options: {
                            fields: [{
                                name: 'name',
                                label: 'field name',
                                type: 'text'
                            }, {
                                name: 'required',
                                label: 'required',
                                type: 'checkbox'
                            }]
                        }
                    }, function (form) {

                        var $modal = $('<div class="modal">');
                        var $advancedOptionsFormPanel = $('<div class="advanced-form"></div>');
                        instance.advancedOptionsForm = form;
                        $advancedOptionsFormPanel.append($('<header><span>Advanced Options</span><button class="close"><i class="fa fa-times"></i> close </button></header>'));
                        $advancedOptionsFormPanel.append(instance.advancedOptionsForm.render());
                        $advancedOptionsFormPanel.append(
                            $('<footer></footer>')
                                .append('<button class="save"><i class="fa fa-floppy-o"></i> save</button>')
                        );

                        instance.mountNode.append($modal.append($advancedOptionsFormPanel));
                        next();

                    });

                });
            });
        },

        getNodePaths: function () {
            return {
                'advancedFormPanel': '> .modal > .advanced-form'
            }
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                var compListEl = instance.mountNode.find('.campsi_component-list')[0];
                var advancedFormEl = instance.nodes.advancedFormPanel.find('> .form');
                Campsi.wakeUp(compListEl, context, function (compListComp) {
                    instance.componentList = compListComp;
                    instance.value = {fields: compListComp.value};
                    Campsi.wakeUp(advancedFormEl, context, function (advancedFormComp) {
                        instance.advancedOptionsForm = advancedFormComp;
                        next();
                    });
                });
            });
        },

        attachEvents: function () {
            var instance = this;
            this.componentList.attachEvents();
            this.advancedOptionsForm.attachEvents();

            this.componentList.bind('change', function () {
                instance.value.fields = this.value;
                instance.trigger('change');
            });

            this.componentList.bind('editAdvancedOptions', function (field) {
                Campsi.get(field.componentType, function (Component) {
                    var formFieldOptions = [{
                        name: 'name',
                        label: 'field name',
                        type: 'text'
                    }, {
                        name: 'required',
                        label: 'required',
                        type: 'checkbox'
                    }];
                    var options = Component.prototype.getAdvancedFormOptions.call();
                    var fields = formFieldOptions.concat(options.fields);
                    instance.currentFieldInAdvancedForm = field;
                    instance.advancedOptionsForm.setOptions({fields: fields}, function () {
                        instance.advancedOptionsForm.setValue(field.value, function () {
                            instance.mountNode.find('.modal').addClass('visible');
                        });
                    });
                });
            });

            instance.nodes.advancedFormPanel.on('click', 'button.close', function () {
                instance.mountNode.find('.modal').removeClass('visible');
            });


            instance.nodes.advancedFormPanel.on('click', 'button.save', function () {


                var newValue = deepCopy(instance.currentFieldInAdvancedForm.value);
                var prop;
                for (prop in instance.advancedOptionsForm.value) {
                    if (instance.advancedOptionsForm.value.hasOwnProperty(prop)) {
                        newValue[prop] = instance.advancedOptionsForm.value[prop];
                    }
                }
                instance.currentFieldInAdvancedForm.setValue(newValue, function () {
                    instance.mountNode.find('.modal').removeClass('visible');
                });
            });

            $(document).on('keyup', function (e) {
                if (e.keyCode === 27) {
                    instance.mountNode.find('.modal').removeClass('visible');
                }
            });
        },

        valueDidChange: function (next) {
            this.componentList.setValue(this.value.fields, next, false);
        },

        save: function () {
            var instance = this;

            var url = this.context.apiURL('collection');
            var method = 'PUT';

            $.ajax({
                url: url,
                method: method,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify({fields: instance.value.fields})
            }).done(function () {
                instance.context.invalidate('collection');
                instance.context.invalidate('entry');
                instance.context.invalidate('entriesAndDrafts');
                instance.trigger('saved');
            }).error(function () {
                instance.trigger('save-error');
            });
        },


        serializeOptions: function () {
        },

        serializeValue: function () {
        }

    }
});