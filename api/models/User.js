/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    attributes: {
        email: {
            type: 'string',
            unique: true,
            lowercase: true
        },
        userName: 'string',

        //twitter stuff
        twitter: 'string',
        twitterToken: 'string',
        twitterSecret: 'string',

        //google stuff
        google: 'string',
        picture: 'string',
        displayName: 'string'
    }
};