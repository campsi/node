module.exports = {
    welcome: {
        title: 'Welcome',
        id: 'welcome',
        classList: ['active', 'w50'],
        rightButtons: ['<button class="close" data-state="projects">close</button>']
    },
    projects: {
        title: 'My Projects',
        id: 'projects',
        classList: ['active', 'w50', 'l50'],
        component: 'campsi/project-list',
        leftButtons: ['<button class="prev" data-state="welcome">back</button>'],
        rightButtons: ['<button class="next" data-state="project">project</button>']
    },
    project: {
        title: 'Project Detail',
        id: 'project',
        classList: ['next'],
        component: 'campsi/project',
        leftButtons: ['<button class="prev" data-state="projects">back</button>'],
        rightButtons: [
            '<button class="save">save</button>',
            '<button class="next" data-state="collection">collection</button>'
        ]
    },
    collection: {
        title: 'Collection Detail',
        id: 'collection',
        classList: ['next'],
        component: 'campsi/collection',
        leftButtons: ['<button class="prev" data-state="project">back</button>'],
        rightButtons: [//todo replace par <a>{attr}
            '<button class="next" data-state="collection-designer:70+components:30">design</button>',
            '<button class="next" data-state="entries:30+entry:70">admin</button>'
        ]
    },
    collectionDesigner: {
        title: 'Collection Designer',
        id: 'collection-designer',
        classList: ['next'],
        component: 'campsi/collection-designer',
        leftButtons: ['<button class="prev" data-state="collection">back</button>']
    },
    components: {
        title: 'Components',
        id: 'components',
        classList: ['next']
    },
    entries: {
        title: 'Entries',
        id: 'entries',
        classList: ['next'],
        component: 'campsi/entry-list',
        leftButtons: ['<button class="next" data-state="collection">back</button>']
    },
    entry: {
        title: 'Entry Form',
        id: 'entry',
        classList: ['next'],
        component: 'form' // create a new one ?
    }
};