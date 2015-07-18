/**
 * MaintenanceController
 *
 * @description :: Server-side logic for managing maintenances
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    //store and retrieve maintenence items for each car, for example
    //oil changes, brake disc changes, wofs

    addMaintenance: function (req, res) {
        User.findOne(req.userId, function (err, user) {

            //TODO: check is vehicle exists?

            Maintenance.create({
                type: req.body.type,

                vehicle: req.body.vehicle,
                owner: req.userId
            }).exec(function (err, post) {
                res.status(200).end();
            });
        });
    }
};