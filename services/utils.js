module.exports = {
    toObject: function(item){
        if(typeof item === 'undefined' || typeof item.toObject === 'undefined'){
            return item;
        }

        var obj = item.toObject();
        obj._id = obj.id = obj._id.toString();
        return obj;
    }
};