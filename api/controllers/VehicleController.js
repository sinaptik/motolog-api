/**
 * VehicleController
 *
 * @description :: Server-side logic for managing vehicles
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    myVehicles: function (req, res) {
        Vehicle.find({
            owner: req.userId
        }, function (err, vehicles) {
            res.json(vehicles);
        })
    },

    addVehicle: function (req, res) {
        User.findOne(req.userId, function (err, user) {

            var make = req.body.make;
            var year = req.body.year;

            Vehicle.create({
                make: make,
                year: year,
                owner: req.userId
            }).exec(function (err, post) {
                res.status(200).end();
            });
        });
    }
};