var _ = require('underscore');
var BaseModel = require('../lib/rethink_base_model');
var r = require('rethinkdb');
var password = require('../lib/password');

module.exports = function(app){

    var model = new BaseModel(this, app, __filename);

    // set model defaults
    model.defaults  = {username: null, email: '', password: '', feeds: []}

    // defines the rethink indexes
    model.indexes = ['username', 'email'];

    model.publicFields = ['id', 'email', 'feeds'];

    var models = app.models;

    model.validateNewUser = function(userObject, callback){
        if( !userObject ||
            // !userObject.username ||
            !userObject.email ||
            !userObject.password ){

            callback(null, {status: 'failure', message: 'User is missing fields'});
            return;
        }

        if( !this._emailIsValid(userObject.email) ){
            callback(null, {status: 'failure', message: 'Email is invalid'});
            return;
        }

        // check if user already exists DB
        r.table(this.name)
            .filter(
                r.row('email').eq(userObject.email)
                // r.row('username').eq(userObject.username)
                // .or(r.row('email')).eq(userObject.email)
            )            
            .run(this.connection, function(err, cursor){
                if( err ){
                    callback(err);
                    return;
                }
                cursor.toArray(function(err, results){
                    if( err ){ callback(err); }
                    else{
                        if( results.length > 0){
                            callback(null,
                                     { status: 'failure',
                                       message: 'User with email or username already exists'});
                        } else {
                            callback(null, { status: 'success' });
                        }
                    }
                });
            });
    }

    /**
        Required:
            options.userId
            options.feedId
    */
    model.addFeed = function(options, callback){
        // Todo: confirm feed exists before adding it
        var self = this;
        this.get(options.userId, function(err, user){
            if( err ){
                callback(err);
                return;
            }
            if( _.contains(user.feeds, options.feedId) ){
                callback();
                return;
            }
            user.feeds.push(options.feedId);
            self.update(user, function(err){
                if( err ){ callback(err); }
                else{ callback(); }
            });
        })
    }

    /**
        Required:
            options.userId
            options.feedId
    */
    model.removeFeed = function(options, callback){
        var self = this;
        this.get(options.userId, function(err, user){
            if( err ){
                callback(err);
                return;
            }
            if( !_.contains(user.feeds, options.feedId) ){
                callback();
                return;
            }
            user.feeds = _.filter(user.feeds, function(feedId){
                return feedId !== options.feedId;
            })
            self.update(user, function(err){
                if( err ){ callback(err); }
                else{ callback(); }
            });
        })
    }


    model.createNew = function(userObject, callback){
        var self = this;
        this.validateNewUser(userObject, function(err, resp){
            if( err ){
                callback(err);
                return;
            }
            if( resp.status !== 'success' ){
                callback(null, resp);
                return;
            }
            password.encryptPassword(userObject.password,
                                     function(err, hashedPassword){
                if( err ){ return callback(err); }
                userObject.password = hashedPassword;
                self.create(userObject, function(err, newUser){
                    if( err ){ return callback(err); }
                    callback(null, {status: 'success',
                                    user: self.getPublic(newUser)});
                });
            });
        });
    }

    /**
        Required:
            options.userId
        Optional:
            options.page
    */
    model.getPosts = function(options, callback){
        var self = this;
        var page = options.page ? options.page : 1;
        this.get(options.userId, function(err, user){
            if( err ){
                callback(err);
                return;
            }
            if( user.feeds.length === 0 ){
                callback(null, []);
                return;
            }
            models.post.getFromFeeds({feedIds: user.feeds, page: page},
                                     callback);
        });
    }

    /**
        Required:
            options.email
            options.password
            options.req
    */
    model.login = function(options, callback){
        var self = this;
        var failure = {status: 'failure',
                       message: 'Email or password is not correct'};
        this.getByEmail(options, function(err, user){
            if( err ){ return callback(err); }
            if( user === null ){ return callback(null, failure); }
            password.comparePasswords(options.password,
                                      user.password,
                                      function(err, isMatch){
                    if( err ){ return callback(err); }
                    if( !isMatch ){ return callback(null, failure) }
                    return callback(null, {status: 'success', user: self.getPublic(user) });
            });
        })
    }

    /**
        Required:
            options.email
    */
    model.getByEmail = function(options, callback){
        this.filter({row: 'email', value: options.email}, function(err, rows){
            if( err ){ return callback(err); }
            if( rows.length !== 1 ){
                return callback(null, null);
            }
            return callback(null, rows[0]);
        });
    }

    model.getPublicUser = function(userId, callback){
        var self = this;
        this.get(userId, function(err, user){
            if( err ){ return callback(err); }
            if( !user ){
                return callback(null,
                                {status: 'failure', message: 'No user found'});
            }
            callback(null, {status: 'success', user: self.getPublic(user)});
        });
    }

    model._emailIsValid = function(email){
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    return model;
}