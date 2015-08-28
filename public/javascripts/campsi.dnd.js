(function(Campsi){

    var drake = dragula({
        copy: true
    });

    drake.on('drop', function(el, target, source){

    });

    Campsi.dnd = {
        addContainer: function(container){
            drake.containers.push(container);
        }
    }
})(Campsi);