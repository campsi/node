/*
 mixin project(project)
 .project
 .logo(data-state='projects+project')
 img(src=project.iconURL)
 span.name= project.name
 */

Campsi.components.add(function ($super) {
    return {

        name: 'campsi/project-list',

        defaultValue: {
            selectedIndex: -1,
            projects:      []
        },

        createDOM: function () {
            this.dom.container = $('<div class="projects">');

            this.dom.root.append(this.dom.container);
        },

        update: function () {
            var newItem    = this.createProjectItem;
            var $container = this.dom.container;

            $(this.value.projects).each(function (i, project) {
                $container.append(newItem(project));
            });
        },

        getProjectIndex: function (id) {
            var index = -1;
            $(this.value.projects).each(function (i, project) {
                if (project._id == id) {
                    index = i;
                }
            });
            return index;
        },

        attachEvents: function () {
            var $container = this.dom.container;
            var instance   = this;

            $container.on('click', '.project', function (event) {
                $container.find('.project').not(this).removeClass('selected');
                $(this).addClass('selected');
                instance.value.selectedIndex = instance.getProjectIndex($(this).data('id'));
                instance.trigger('change');
            });
        },

        getSelectedProject: function () {
            return this.value.projects[this.value.selectedIndex];
        },

        createProjectItem: function (project) {
            var $project = $('<div class="project">');
            var $logo    = $('<div class="logo">');
            var $name    = $('<span class="name">').text(project.name);

            $logo.append($('<img>').attr('src', project.iconURL));
            $project.append($logo);
            $project.append($name);
            $project.data('id', project._id);

            return $project;
        }
    }
});