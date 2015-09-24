var projectComponent;
var projectListComponent;
var collectionDesignerComponent;
var entryListComponent;
var entryFormComponent;

(function () {


    var Campsi = require('campsi');
    var $projectDetail = $('#project .component-container');
    var $collectionDesigner = $('#collection-designer .component-container');
    var $entries = $('#entries .component-container');
    var $entry = $('#entry .component-container');
    var projectUrl;
    var collectionUrl;
    var entryListUrl;
    var entryUrl;

    function openEntryList(id) {

        function done() {
            hola('entries:30+entry:70');
        }

        collectionUrl = '/api/v1/collections/' + id[0];
        entryListUrl = collectionUrl + '/entries';
        if (typeof entryListComponent === 'undefined') {
            $.ajax(entryListUrl + '/list', {dataType: 'html', contentType: 'text/html'}).done(function (html) {
                $entries.append(html);
                Campsi.wakeUp($entries.find('> .component'), function (comp) {
                    entryListComponent = comp;
                    entryListComponent.attachEvents();
                    done();
                })
            });
        } else {
            $.getJSON(entryListUrl, function (data) {
                entryListComponent.setValue(data, done);
            });
        }
    }

    function openEntryForm(id) {

        entryUrl = entryListUrl + '/' + id;

        console.info("loading", collectionUrl);
        $.getJSON(collectionUrl).done(function (formOptions) {
            console.info("loading", entryUrl);
            $.getJSON(entryUrl).done(function (entry) {
                if (typeof entryFormComponent === 'undefined') {
                    Campsi.create('form', formOptions, entry.data, function (comp) {
                        entryFormComponent = comp;
                        entryFormComponent.attachEvents();
                        $entry.append(entryFormComponent.render());
                    });
                } else {
                    entryFormComponent.setOptions(formOptions, function () {
                        entryFormComponent.setValue(entry.data, function () {
                            console.info("entry form ready");
                        });
                    });
                }
            });
        });


    }

    function openCollectionDesigner(id) {

        function done() {
            hola('collection-designer:70+components:30');
        }

        collectionUrl = '/api/v1/collections/' + id[0]; // todo fix id as array
        if (typeof collectionDesignerComponent === 'undefined') {
            $.ajax(collectionUrl + '/collection-designer-component', {dataType: 'html'}).done(function (html) {
                $collectionDesigner.append(html);
                Campsi.wakeUp($collectionDesigner.find('> .component'), function (comp) {
                    collectionDesignerComponent = comp;
                    collectionDesignerComponent.attachEvents();
                    collectionDesignerComponent.bind('change', collectionChangeHandler);
                    done();
                });
            });
        } else {
            $.getJSON(collectionUrl, function (data) {
                collectionDesignerComponent.setValue(data, done);
            });
        }
    }

    function projectChangeHandler() {
        $('#project').addClass('modified');
        console.info("project change", projectComponent.value);
    }

    function collectionChangeHandler() {
        $('#collection-designer').addClass('modified');
        console.info("collection change", collectionDesignerComponent.value);
    }


    function openProject(id) {
        projectUrl = '/api/v1/projects/' + id;

        var done = function () {
            $('#project').removeClass('modified');
            $('.project[data-id=' + id + ']').addClass('active');
            hola('projects+project');
        };

        if (projectComponent) {
            $.getJSON(projectUrl, function (data) {
                projectComponent.setValue(data, done);
            });
        } else {

            $.ajax(projectUrl + '/project-component', {dataType: 'html'}).done(function (html) {
                $projectDetail.append(html);
                Campsi.wakeUp($projectDetail.find('> .component'), function (comp) {
                    projectComponentReady(comp, done);
                })
            });
        }
    }

    var projectComponentReady = function (component, callback) {
        projectComponent = component;
        projectComponent.attachEvents();
        projectComponent.bind('design-collection', openCollectionDesigner);
        projectComponent.bind('admin-collection', openEntryList);
        projectComponent.bind('change', projectChangeHandler);
        callback()
    };

    var newProject = function () {

        var done = function () {
            $('#project').removeClass('modified');
            hola('projects+project');
        };

        projectUrl = '/api/v1/projects';

        if (projectComponent) {
            projectComponent.setValue({}, done);
        } else {
            Campsi.create('campsi/project', undefined, undefined, function (comp) {
                $projectDetail.append(comp.render());
                projectComponentReady(comp, done);
            });
        }
    };

    $(document).on('dblclick', '.campsi_collection-designer_field header', function () {
        $(this).closest('.campsi_collection-designer_field').toggleClass('closed');
    });

    $(document).on('click', '#project header button.save', function () {


        var value = projectComponent.value;

        var ajaxOptions = {
            url: projectUrl,
            method: 'PUT',
            dataType: 'json',
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(value)
        };

        if(projectUrl === '/api/v1/projects'){
            ajaxOptions.method = 'POST';
        }

        $.ajax(ajaxOptions).done(function () {
            $('#project').removeClass('modified');
            $.getJSON('/api/v1/projects', function (data) {
                projectListComponent.setValue(data, function () {
                    console.info("projectList updated", data);
                });
            });
        }).error(function () {
            console.error(arguments)
        })
    });

    $(document).on('click', '#collection-designer header button.save', function () {
        var value = collectionDesignerComponent.value;
        $.ajax({
            url: collectionUrl,
            method: 'PUT',
            dataType: 'json',
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(value)
        }).done(function () {
            $('#collection-designer').removeClass('modified')
        }).error(function () {
            console.error(arguments)
        })
    });

    $(document).on('click', '.campsi_entry-list_entry', function () {
        openEntryForm($(this).data('id'));
    });

    $('#projects .content').load('/api/v1/projects/list', function () {
        Campsi.wakeUp($('.campsi_project-list')[0], function (comp) {
            projectListComponent = comp;
            projectListComponent.attachEvents();
            projectListComponent.bind('select', function (id) {
                if (typeof id === 'undefined') {
                    newProject();
                } else {
                    openProject(id);
                }
            });
        });
    });


})();