db.getCollection('events').createIndex({'data.user._id' : 1});
db.getCollection('events').createIndex({'data.project._id' : 1});
db.getCollection('events').createIndex({'date' : 1});
db.getCollection('events').createIndex({'event' : 1});