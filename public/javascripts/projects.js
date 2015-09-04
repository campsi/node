var projectList;

$(document).on('click', '.project[data-id]', function(){
   var projectUrl = '/api/v1/projects/'  + $(this).data('id');
    $('#project-detail').load(projectUrl);
    hola('projects:20+project:80')

});