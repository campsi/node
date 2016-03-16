module.exports = function createAppEvent(req) {

    var payload = {};

    if (req.entry) {
        payload.entry = req.entry._id.toString();
    }

    if (req.draft) {
        payload.draft = req.draft._id.toString();
    }

    if (req.collection) {
        payload.collection = {
            _id: req.collection._id.toString(),
            name: req.collection.name,
            identifier: req.collection.identifier
        };
    }

    if (req.project) {
        payload.project = {
            _id: req.project._id.toString(),
            title: req.project.title,
            identifier: req.project.identifier
        };
    }

    if(req.user){
        payload.user = {
            _id: req.user._id.toString(),
            nickname: req.user.nickname
        };
    }

    return payload;

};