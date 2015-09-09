
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
                });
            });
        } else {
            $.getJSON(collectionUrl, function (data) {
                collectionDesignerComponent.setValue(data);
            });
        }
        hola('collection-designer+components');
    }

    function openProject(id) {
        var projectUrl = '/api/v1/projects/' + id;
        if (projectComponent) {
            $.getJSON(projectUrl, function (data) {
                projectComponent.setValue(data);
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
                })
            });


        }
        hola('projects+project')
    }

    $(document).on('click', '.project[data-id]', function () {
        openProject($(this).data('id'));
    });
    //openCollectionDesigner('55d24a9d7cef40e57bea0c72')
})();