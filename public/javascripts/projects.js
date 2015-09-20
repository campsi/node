var projectComponent;
var projectListComponent;
var collectionDesignerComponent;

(function () {


    var Campsi = require('campsi');
    var $projectDetail = $('#project .component-container');
    var $collectionDesigner = $('#collection-designer .component-container');
    var projectUrl;
    var collectionUrl;

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
        projectComponent.bind('admin-collection', function (id) {
            alert('admin: ' + id);
        });
        projectComponent.bind('delete-collection', function () {

        });
        projectComponent.bind('change', projectChangeHandler);
        callback()
    };

    var newProject = function () {

        var done = function () {
            $('#project').removeClass('modified');
            hola('projects+project');
        };

        if (projectComponent) {
            projectComponent.setValue({}, done);
        } else {
            Campsi.create('campsi/project', undefined, undefined, function (comp) {
                $projectDetail.append(comp.render());
                projectComponentReady(comp, done);
            });
        }
    };

    $(document).on('click', '.project[data-id]', function () {
        $('.project').removeClass('active');
        openProject($(this).data('id'));
    });

    $(document).on('click', '.project.placeholder', function () {
        $('.project').removeClass('active');
        newProject();
    });


    $(document).on('dblclick', '.campsi_collection-designer_field header', function () {
        $(this).closest('.campsi_collection-designer_field').toggleClass('closed');
    });

    $(document).on('click', '#project header button.save', function () {
        var value = projectComponent.value;

        $.ajax({
            url: projectUrl,
            method: 'PUT',
            dataType: 'json',
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(value)
        }).done(function(){
            $('#project').removeClass('modified');
            $.getJSON('/api/v1/projects', function(data){
                projectListComponent.setValue(data, function(){
                    console.info("projectList updated", data);
                });
            });
        }).error(function(){
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
        }).done(function(){
            $('#collection-designer').removeClass('modified')
        }).error(function(){
            console.error(arguments)
        })
    });



    $('#projects .content').load('/api/v1/projects/list', function(){
        Campsi.wakeUp($('.campsi_project-list')[0], function(comp){
            projectListComponent = comp;
            projectListComponent.attachEvents();
            projectListComponent.bind('select', function(id){
                openProject(id);
            });
        });
    });


})();