var projectComponent;
var collectionDesignerComponent;

(function () {


    var Campsi = require('campsi');
    var $projectDetail = $('#project .component-container');
    var $collectionDesigner = $('#collection-designer .component-container');

    function openCollectionDesigner(id) {
        var collectionUrl = '/api/v1/collections/' + id[0]; // todo fix id as array
        if (typeof collectionDesignerComponent === 'undefined') {
            $.ajax(collectionUrl + '/collection-designer-component', {dataType: 'html'}).done(function (html) {
                $collectionDesigner.append(html);
                Campsi.wakeUp($collectionDesigner.find('> .component'), function (comp) {
                    collectionDesignerComponent = comp;
                    collectionDesignerComponent.attachEvents();
                    hola('collection-designer:70+components:30');
                });
            });
        } else {
            $.getJSON(collectionUrl, function (data) {
                collectionDesignerComponent.setValue(data, function () {
                    hola('collection-designer:70+components:30');
                });
            });
        }
    }

    function projectChangeHandler(){
        $('#project').addClass('modified');
        console.info("project change", projectComponent.value);
    }

    function openProject(id) {
        var projectUrl = '/api/v1/projects/' + id;
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
                    projectComponent = comp;
                    projectComponent.attachEvents();
                    projectComponent.bind('design-collection', openCollectionDesigner);
                    projectComponent.bind('admin-collection', function (id) {
                        alert('admin: ' + id);
                    });
                    projectComponent.bind('delete-collection', function () {

                    });

                    projectComponent.bind('change', projectChangeHandler);
                    done()
                })
            });
        }

    }

    $(document).on('click', '.project[data-id]', function () {
        $('.project').removeClass('active')
        openProject($(this).data('id'));
    });
    //openCollectionDesigner('55d24a9d7cef40e57bea0c72')
})();