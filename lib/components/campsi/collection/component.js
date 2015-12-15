var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var extend = require('extend');
var page = require('page');
var slug = require('slug');

module.exports = Campsi.extend('form', 'campsi/collection', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                fields: [{
                    name: 'name',
                    type: 'text',
                    additionalClasses: ['invisible', 'big-title']
                }, {
                    name: 'icon',
                    type: 'file/image',
                    label: 'icon',
                    additionalClasses: ['icon', 'horizontal']
                }, {
                    name: 'identifier',
                    type: 'text',
                    label: this.context.translate('panels.collection.fields.identifier'),
                    additionalClasses: ['horizontal']
                }, /*{
                 label: this.context.translate('panels.collection.fields.templates'),
                 additionalClasses: ['horizontal'],
                 name: 'editTemplates',
                 type: 'button',
                 text: this.context.translate('panels.collection.fields.templates.btn')
                 },*/ {
                    name: 'url',
                    type: 'handlebars',
                    label: this.context.translate('panels.collection.fields.URL'),
                    additionalClasses: ['horizontal', 'url'],
                    template: '<a href="{{this}}" target="_blank">{{this}}</a>'
                }, {
                    name: 'fields',
                    type: 'campsi/component-list',
                    additionalClasses: ['fields'],
                    label: this.context.translate('panels.collection.fields.fields')
                }]
            }
        },

        getDefaultAdvancedFormFields: function () {
            return [{
                name: 'name',
                label: this.context.translate('panels.designer.advancedForm.fields.name'),
                type: 'text'
            }, {
                name: 'required',
                label: this.context.translate('panels.designer.advancedForm.fields.required'),
                type: 'checkbox'
            }]
        },

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                Campsi.create('form', {
                    context: instance.context,
                    options: {
                        fields: instance.getDefaultAdvancedFormFields()
                    }
                }, function (form) {

                    var $modal = $('<div class="modal">');
                    var $advancedOptionsFormPanel = $('<div class="advanced-form"></div>');
                    instance.advancedOptionsForm = form;
                    $advancedOptionsFormPanel.append($('<header>' +
                        '                                  <span class="title"></span>' +
                        '                                  <button class="close"><i class="fa fa-times"></i><span></span></button>' +
                        '                               </header>'));
                    $advancedOptionsFormPanel.find('header .title').text(instance.context.translate('panels.designer.advancedForm.title'));
                    $advancedOptionsFormPanel.find('header .close span').text(instance.context.translate('panels.designer.advancedForm.close'));
                    $advancedOptionsFormPanel.append(instance.advancedOptionsForm.render());
                    $advancedOptionsFormPanel.append(
                        $('<footer></footer>')
                            .append('<button class="save"><i class="fa fa-floppy-o"></i><span></span></button>')
                    );
                    $advancedOptionsFormPanel.find('footer .save span').text(instance.context.translate('panels.designer.advancedForm.save'));
                    instance.mountNode.append($modal.append($advancedOptionsFormPanel));
                    next();

                });
            });
        },

        getNodePaths: function () {
            return extend($super.getNodePaths(), {
                'advancedFormPanel': '> .modal > .advanced-form'
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                var advancedFormEl = instance.nodes.advancedFormPanel.find('> .form');
                Campsi.wakeUp(advancedFormEl, context, function (advancedFormComp) {
                    instance.advancedOptionsForm = advancedFormComp;
                    next();
                });
            });
        },

        attachEvents: function () {
            $super.attachEvents.call(this);
            var instance = this;

            this.advancedOptionsForm.attachEvents();
            /*

             this.fields.editTemplates.component.mountNode.on('click', function () {
             window.editor = window.open('/editor');
             window.editor.onload = function () {
             window.editor.setValue(instance.value, function (collection) {
             instance.templateChangeHandler(collection);
             });
             }
             });
             */

            this.fields.fields.bind('editAdvancedOptions', function (field) {
                Campsi.get(field.componentType, function (Component) {
                    var formFieldOptions = instance.getDefaultAdvancedFormFields();
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

        processValue: function (data, cb) {

            if (typeof data._id !== 'undefined') {

                if ((typeof data.identifier === 'undefined' || data.identifier === '')
                    && typeof data.name === 'string') {
                    data.identifier = slug(data.name);
                }

                data.url = this.context.config.host + this.context.apiURL('collection', {collection: data}, false) + '/entries';
            }

            cb([], data);
        },

        //templateChangeHandler: function (collection) {
        //    this.value.templates = collection.templates;
        //    this.save({templates: this.value.templates});
        //},

        save: function (data) {

            var instance = this;
            var ctx = instance.context;
            var url = ctx.apiURL('project') + '/collections';
            var method = 'POST';
            if (instance.value._id) {
                url = ctx.apiURL('collection');
                method = 'PUT';
            }

            $.ajax({
                url: url,
                method: method,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(data || instance.value)
            }).done(function (data) {
                var newValue = extend({}, data, instance.value);
                instance.setValue(newValue, function () {
                    instance.trigger('saved');
                    ctx.invalidate('collection');
                    ctx.invalidate('project');
                    ctx.set('collection', newValue);
                    instance.trigger('reset');
                    page(ctx.applicationURL('collection'));
                });
            }).error(function () {
                instance.trigger('save-error');
            });
        },


        delete: function () {
            var instance = this;
            var ctx = this.context;
            if (this.value._id) {
                $.ajax({
                    url: this.context.apiURL('collection'),
                    method: 'DELETE'
                }).done(function () {
                    instance.setValue(undefined, function () {
                        ctx.invalidate('collection');
                        ctx.invalidate('project');
                        page(ctx.applicationURL('project'));
                    });
                }).error(function () {
                    console.error('could not delete', err);
                });
            }
        },

        serializeValue: function () {
            return {
                _id: this.value._id,
                identifier: this.value.identifier
            }
        },

        serializeOptions: function () {
        }

    }
});