
module.exports = function(regex) {
    return function(req, res, next) {
        if (!regex.test(req.url)) { return next(); }

        /*
         TODO vérifier sur le marketplace que le client a le droit d'accès au composant
         userIsAllowed(function(allowed) {
         if (allowed) {
         next(); // send the request to the next handler, which is express.static
         } else {
         res.end('You are not allowed!');
         }
         });
         */
        next();
    };
}