module.exports = function(content, icon, classes){
    return {
        tag: 'button',
        attr: {
            class: classes
        },
        content: content,
        icon: icon
    }
};