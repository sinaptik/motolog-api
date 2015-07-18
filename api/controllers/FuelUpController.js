/**
 * FuelUpController
 *
 * @description :: Server-side logic for managing Fuelups
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    addFuelUp: function (req, res) {
        User.findOne(req.userId, function (err, user) {

            //TODO: check is vehicle exists?

            FuelUp.create({
                litres: req.body.litres,
                costPerLitre: req.body.costPerLitre,
                kilometersSinceLastFuelUp: req.body.kilometersSinceLastFuelUp,
                vehicle: req.body.vehicle,
                owner: req.userId
            }).exec(function (err, post) {
                res.status(200).end();
            });
        });
    }
};