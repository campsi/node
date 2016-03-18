var linkButton = require('./linkButton');

module.exports = function(app, href){
  return linkButton(
      href,
      app.translate('btns.back'),
      'angle-left',
      'back'
  );
};