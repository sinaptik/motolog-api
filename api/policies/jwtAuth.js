var jwt = require('jwt-simple');

module.exports = function (req, res, next) {

    if (!req.headers.authorization) {
        return res.forbidden('No auth header');
    }

    var token = req.headers.authorization.split(' ')[1];

    var payload = jwt.decode(token, config.TOKEN_SECRET);

    if (!payload.sub) {
        return res.forbidden('No user id in payload');
    }

    req.userId = payload.sub;

    next();
}