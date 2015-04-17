module.exports = function (req, res, next) {
    var model = req.options.model;

    if (!model) {
        return res.serverError('Model is required for ownResource policy');
    }

    var Model = req._sails.models[model];

    Model.findOne(req.params.id).exec(function (err, record) {
        if (!record.owner) {
            return res.serverError('Model requires owner property for ownResource policy');
        }

        if (record.owner !== req.userId) {
            return res.forbidden('User does not have access to this resource');
        }

        req.record = record;
        next();
    });
};