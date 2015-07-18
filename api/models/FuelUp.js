/**
 * FuelUp.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        litres: 'float',
        costPerLitre: 'float',
        kilometersSinceLastFuelUp: 'float',

        vehicle: {
            model: 'vehicle'
        },
        owner: {
            model: 'user'
        }
    }
};