Campsi.components.add(function ($super) {
    return {
        name:     'campsi/collection-list',
        selected: null,

        createDOM: function () {
            this.dom.control.append(this.dom.list = $('<div class="collections">'));
        },

        attachEvents: function () {
            var instance = this;
            this.dom.root.on('click', '.collection', function () {
                instance.selected = instance.value[$(this).index()];
                instance.trigger('select');
            });
        },

        update: function () {
            var $list = this.dom.list.empty();
            $(this.value).each(function (i, collection) {
                $list.append(
                    $('<div class="collection">').append(
                        $('<span class="name">').text(collection.name)
                    )
                );
            });
        }
    }
});