var Simplevent = function(){
};

Simplevent.prototype = {
    bind	: function(event, fct){
        this._events = this._events || {};
        this._events[event] = this._events[event]	|| [];
        this._events[event].push(fct);
    },
    unbind	: function(event, fct){
        this._events = this._events || {};
        if( event in this._events === false  )	return;
        this._events[event].splice(this._events[event].indexOf(fct), 1);
    },
    trigger	: function(event /* , args... */){
        this._events = this._events || {};
        if( event in this._events === false  )	return;
        for(var i = 0; i < this._events[event].length; i++){
            this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1))
        }
    }
};




// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
    module.exports	= Simplevent
}
