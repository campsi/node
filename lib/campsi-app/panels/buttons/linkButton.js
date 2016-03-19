module.exports = function(href, content, icon, classes){
  return {
      tag: 'a',
      attr: {class: classes, href: href},
      content: content,
      icon: icon
  }
};