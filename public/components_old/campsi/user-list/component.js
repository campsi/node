Campsi.components.add(function ($super) {
    return {
        name: 'campsi/user-list',


        createDOM: function(){
            this.dom.list = $('<ul class="users">');
            this.dom.root.append(this.dom.list);
        },

        update: function(){
            var $list  = this.dom.list.empty();
            var createItem = this.createUserListItem;
            $(this.value).each(function(i, user){
                $list.append(createItem(user));
            });
        },

        createUserListItem: function(user){
            var $li = $('<li>').data('id', user._id);
            $li.append($('<div class="avatar">').append($('<img>').attr('src', user.picture)));
            $li.append($('<span class="username">').text(user.name));
            return $li;
        }
    }
});