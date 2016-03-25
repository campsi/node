db.projects.find().forEach(function(project){
    if(project.icon.uri){
        project.icon.src = project.icon.uri
        db.projects.save(project);
    }
});

function addSrcProp(obj, change){
    var prop;
    for(prop in obj){
        if(obj.hasOwnProperty(prop)){
            if(typeof obj[prop] === 'object'){
                if(addSrcProp(obj[prop])){
                    change = true;
                }
            } else if (prop === 'uri') {
                obj.src = obj.uri;
                change = true;
                print('update', obj.uri);
            }
        }
    }
    return change;
}

db.entries.find().forEach(function(entry){
    if(addSrcProp(entry.data)){
        db.entries.save(entry);
    }
});

db.drafts.find().forEach(function(draft){
    if(addSrcProp(draft.data)){
        db.drafts.save(draft);
    }
});