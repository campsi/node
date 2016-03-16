var config = require('../config');
var sendgrid  = require('sendgrid')(config.sendgrid_api_key);



var Campsi = require('campsi-core');
var Project = require('../models/project');

var sendBackupByEmail = function(address, filename, payload){

    var email     = new sendgrid.Email({
        to:       address,
        from:     'backup@campi.io',
        subject:  'Backup',
        text:     'Modification'
    });

    email.addFile({
        filename: filename + '.json',
        content:  new Buffer(JSON.stringify(payload))
    });

    sendgrid.send(email, function(err, json) {
        if (err) { return console.error(err); }
        console.log(json);
    });
};

Campsi.eventbus.on('entry:*', function(data){
    Project.findOne({_id: data.project._id}).select('deployments').exec(function (err, p) {
        p.deployments.forEach(function(d){
            if(d.connection === 'EMAIL'){
                data.collection.export(function(exported){
                    sendBackupByEmail(d.email.value, data.collection.identifier, exported);
                });
            }
        })
    });
});
