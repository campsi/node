var projectList;


$.getJSON('/api/v1/projects', function (projects) {

    Campsi.components.create({
        type: 'campsi/project-list'
    }, {
        projects: projects
    }, null, function(component){
        projectList = component;
        projectList.on('change', function(){
            openProject(projectList.getSelectedProject())
        });

        $('#projectList').append(component.html());
    });
});

var projectDetailForm;

Campsi.components.create({
    type: 'campsi/project'
}, {}, {}, function (component) {
    projectDetailForm = component;
    $('#projectDetail').append(component.html());
});

function openProject(project) {
    projectDetailForm.val(project);
    hola('projects+project')
}