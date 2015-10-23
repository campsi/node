db.users.update({}, {$set: {projects: []}}, {multi: true});

db.projects.find().forEach(function (p) {

    print('SETTING USER TO PROJECT ' + p._id + ' ' + p.title);

    var projectFound = false;
    var roleFound = false;

    p.admins.forEach(function (a) {
        projectFound = false;
        var user = db.users.find({_id: a})[0];

        user.projects.forEach(function (userProject) {
            print('ADDING ADMIN' + user._id + ' to project ' + p._id + ' ('+ p.title +')');
            if (userProject._id.toString() === p._id.toString()) {
                projectFound = true;
                //print('project already defined in user\'s projects');
                userProject.roles.forEach(function(r){
                    if(r === 'admin'){
                        //print('user is already admin');
                        roleFound = true;
                    }
                });
                if (roleFound === false) {
                    //print('adding admin role');
                    userProject.roles.push('admin');
                }
            }
        });

        if (projectFound === false) {
            //print('project not yet defined in user');
            user.projects.push({roles: ['admin'], _id: p._id});
        }

        //print('saving user');
        db.users.save(user);
    });

    p.designers.forEach(function (a) {
        projectFound = false;
        var user = db.users.find({_id: a})[0];
        user.projects.forEach(function (userProject) {
            print('ADDING DESIGNER ' + user._id + ' to project ' + p._id + ' ('+ p.title +')');
            print('COMPARING ' + p._id + ' / ' + userProject._id);

            if (userProject._id.toString() === p._id.toString()) {
                print('FOUND');
                projectFound = true;
                userProject.roles.forEach(function(r){
                    print(p.title, r);
                    if(r === 'designer'){
                        roleFound = true;
                    }
                });
                if (roleFound === false) {
                    userProject.roles.push('designer');
                }
            }
        });

        if (projectFound === false) {
            user.projects.push({roles: ['designer'], _id: p._id});
        }

        db.users.save(user);
    });
});