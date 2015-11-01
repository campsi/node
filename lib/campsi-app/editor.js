var ace = require('brace');
require('brace/mode/handlebars');
require('brace/theme/twilight');

var _template, _collection, _onChange, _ready = false;
var $templates, $properties, propertiesFields;


var editor = ace.edit('ace');
editor.setTheme('ace/theme/twilight');
var session = editor.getSession();
session.setMode('ace/mode/handlebars');
session.on('change', function (e) {
    if (typeof _template !== 'undefined') {
        _template.markup = editor.getValue();
    }
});
var createTemplate = function (template, index) {
    console.info(template.scope);
    var $div = $('<a>').addClass('template').attr('href', '#' + index);
    var $icon = $('<i>').addClass('fa')
        .toggleClass('fa-cube', template.scope === 'entry')
        .toggleClass('fa-cubes', template.scope === 'collection');

    $div.append($icon);
    $div.append($('<span>').text(template.identifier).addClass('name'));
    return $div;
};


window.setValue = function (collection, onChange) {


    _collection = JSON.parse(JSON.stringify(collection));
    _onChange = onChange;

    if (_ready) {
        render();
    }
};

var render = function () {
    console.info(_collection);
    $('h1').text(_collection.name);
    renderTemplateList();
    editor.setValue('');
}

var renderTemplateList = function(){
    $templates.empty();
    _collection.templates.forEach(function (template, i) {
        $templates.append(createTemplate(template, i));
    });
    $templates.append('<a href="#" class="template new"><i class="fa fa-plus"></i><span class="name">Add template</span></a>');
};

$(function () {

    console.info("Code Editor INIT");

    $templates = $('#templates');
    $properties = $('#properties');
    propertiesFields = {
        name: $properties.find('input[name=identifier]'),
        scope: $properties.find('select[name=scope]')
    };


    $(window).on('hashchange', function () {
        var index = parseInt(location.hash.substring(1));

        if(isNaN(index)){
            _collection.templates.push({
                identifier: 'new_template',
                markup: '',
                scope: 'entry'
            });

            location.hash = _collection.templates.length -1;
            return;

        } else {
            _template = _collection.templates[index];
        }
        renderTemplateList();

        $templates
            .find('a')
            .removeClass('active')
            .filter('[href="' + location.hash + '"]')
            .addClass('active');

        editor.setValue(_template.markup);
        propertiesFields.name.val(_template.identifier);
        propertiesFields.scope.val(_template.scope);
    });

    $('button.save').click(function(){
        _onChange.call(null, _collection);
    });

    $('button.close').click(function(){
        window.close();
    });

    propertiesFields.name.on('change', function(){
        _template.identifier = propertiesFields.name.val();
        renderTemplateList();
    });

    propertiesFields.scope.on('change', function(){
        _template.scope = propertiesFields.scope.val();
        renderTemplateList();
    });

    $properties.on('submit', function () {
        return false;
    });

    _ready = true;

    if (typeof _collection !== 'undefined') {
        render();
    }
});