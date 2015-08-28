Campsi.components.extend('text', function ($super) {
    return {
        name: 'number',
        createDOM: function () {
            $super.createDOM.call(this);
            this.dom.root.addClass('number');
            this.dom.input.attr('type', 'number');
        }
    }
});