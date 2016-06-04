module.exports = function (parent, child, index) {
    var size = parent.children().length;
    if (index === 0) {
        return parent.prepend(child);
    }
    if (index > size) {
        return parent.append(child);
    }
    return parent.children().eq(index - 1).after(child);
};