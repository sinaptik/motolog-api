/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var qs = require('querystring');
var request = require('request');
var jwt = require('jwt-simple');
var moment = require('moment');
var bodyParser = require('body-parser');

module.exports = {
    me: function (req, res) {

        //may not need this if jwtAuth is implemented
        if (!req.headers.authorization) {
            return res.status(400).send({
                message: 'No auth token'
            });
        }

        var token = req.headers.authorization.split(' ')[1];
        var payload = jwt.decode(token, config.TOKEN_SECRET);

        User.findById(payload.sub, function (err, user) {

            //TODO: return error if user, user[0] is null. This means that we couldn't find the user

            var foundUser = user[0];

            //sanitize
            if (foundUser.twitter)
                delete foundUser.twitter;

            if (foundUser.twitterSecret)
                delete foundUser.twitterSecret;

            if (foundUser.twitterToken)
                delete foundUser.twitterToken;

            //OK
            res.send(foundUser);

        });
    },

    twitterlogin: function (req, res) {
        var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
        var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
        var authenticateUrl = 'https://api.twitter.com/oauth/authorize';

        if (!req.query.oauth_token || !req.query.oauth_verifier) {
            var requestTokenOauth = {
                consumer_key: config.TWITTER_KEY,
                consumer_secret: config.TWITTER_SECRET,
                callback: config.TWITTER_CALLBACK
            };

            // Step 1. Obtain request token for the authorization popup.
            request.post({
                url: requestTokenUrl,
                oauth: requestTokenOauth
            }, function (err, response, body) {
                var oauthToken = qs.parse(body);
                var params = qs.stringify({
                    oauth_token: oauthToken.oauth_token
                });

                // Step 2. Redirect to the authorization screen.
                res.redirect(authenticateUrl + '?' + params);
            });
        } else {
            var accessTokenOauth = {
                consumer_key: config.TWITTER_KEY,
                consumer_secret: config.TWITTER_SECRET,
                token: req.query.oauth_token,
                verifier: req.query.oauth_verifier
            };

            // Step 3. Exchange oauth token and oauth verifier for access token.
            request.post({
                url: accessTokenUrl,
                oauth: accessTokenOauth
            }, function (err, response, profile) {
                profile = qs.parse(profile);

                // Step 4a. Link user accounts.
                if (req.headers.authorization) {
                    User.findOne({
                        twitter: profile.user_id
                    }, function (err, existingUser) {
                        if (existingUser) {
                            return res.status(409).send({
                                message: 'There is already a Twitter account that belongs to you'
                            });
                        }
                        var token = req.headers.authorization.split(' ')[1];
                        var payload = jwt.decode(token, config.TOKEN_SECRET);
                        User.findById(payload.sub, function (err, user) {
                            if (!user) {
                                return res.status(400).send({
                                    message: 'User not found'
                                });
                            }
                            user.twitter = profile.user_id;
                            user.userName = user.userName || profile.screen_name;
                            user.twitterToken = profile.oauth_token;
                            user.twitterSecret = profile.oauth_token_secret;
                            user.save(function (err) {
                                res.send({
                                    token: createToken(user)
                                });
                            });
                        });
                    });
                } else {
                    // Step 4b. Create a new user account or return an existing one.
                    User.findOne({
                        twitter: profile.user_id
                    }, function (err, existingUser) {
                        if (existingUser) {
                            var token = createToken(existingUser);
                            return res.send({
                                token: token
                            });
                        }
                        User.create({
                            twitter: profile.user_id,
                            userName: profile.screen_name,
                            twitterToken: profile.oauth_token,
                            twitterSecret: profile.oauth_token_secret,
                        }).exec(function (err, user) {
                            var token = createToken(user);
                            res.send({
                                token: token
                            });
                        });
                    });
                }
            });
        }
    },

    googleLogin: function (req, res) {
        var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
        var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

        var params = {
            code: req.body.code,
            client_id: req.body.clientId,
            client_secret: config.GOOGLE_SECRET,
            redirect_uri: req.body.redirectUri,
            grant_type: 'authorization_code'
        };

        // Step 1. Exchange authorization code for access token.
        request.post(accessTokenUrl, {
            json: true,
            form: params
        }, function (err, response, token) {
            var accessToken = token.access_token;
            var headers = {
                Authorization: 'Bearer ' + accessToken
            };

            // Step 2. Retrieve profile information about the current user.
            request.get({
                url: peopleApiUrl,
                headers: headers,
                json: true
            }, function (err, response, profile) {

                // Step 3a. Link user accounts.
                if (req.headers.authorization) {
                    User.findOne({
                        google: profile.sub
                    }, function (err, existingUser) {
                        if (existingUser) {
                            return res.status(409).send({
                                message: 'There is already a Google account that belongs to you'
                            });
                        }
                        var token = req.headers.authorization.split(' ')[1];
                        var payload = jwt.decode(token, config.TOKEN_SECRET);
                        User.findById(payload.sub, function (err, user) {
                            if (!user) {
                                return res.status(400).send({
                                    message: 'User not found'
                                });
                            }
                            user.google = profile.sub;
                            user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
                            user.displayName = user.displayName || profile.name;
                            user.save(function () {
                                var token = createToken(user);
                                res.send({
                                    token: token
                                });
                            });
                        });
                    });
                } else {
                    // Step 3b. Create a new user account or return an existing one.
                    User.findOne({
                        google: profile.sub
                    }, function (err, existingUser) {
                        if (existingUser) {
                            return res.send({
                                token: createToken(existingUser)
                            });
                        }

                        //create new user
                        User.create({
                            google: profile.sub,
                            picture: profile.picture.replace('sz=50', 'sz=200'),
                            displayName: profile.name
                        }).exec(function (err, user) {
                            var token = createToken(user);
                            res.send({
                                token: token
                            });
                        });
                    });
                }
            });
        });
    }
};

function createToken(user) {
    var payload = {
        sub: user.id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
}