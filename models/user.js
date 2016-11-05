var _ = require('underscore');
var BaseModel = require('../lib/rethink_base_model');
var errors = require('../lib/errors');
var r = require('rethinkdb');
var password = require('../lib/password');

module.exports = function(app){

    var model = new BaseModel(this, app, __filename);

    // set model defaults
    model.defaults  = { userId: null,
                        feeds: [],
                        tags: {}    };

    // defines the rethink indexes
    model.indexes = ['userId'];

    model.publicFields = ['id', 'userId', 'feeds', 'tags'];

    var models = app.models;

    model.get = function(userId, callback){
        r.table(this.name)
            .getAll(userId, {index: 'userId'})
            .coerceTo('array')
            .run(this.connection, function(err, response){
                if( err ){ return callback(err); }
                if( response ){ return callback(null, response[0]); }
        });
    }

    model.createNew = function(userObject, callback){
        var self = this;
        this.create(userObject, function(err, newUser){
            if( err ){ return callback(err); }
            callback(null, {status: 'success',
                            user: self.getPublic(newUser)});
        });
    }

    model.getPublicUser = function(userId, callback){
        var self = this;
        this.get(userId, function(err, user){
            if( err ){
                return callback(err);
            }
            if( !user ){
                // create it
                self.createNew({userId: userId}, function(err, resp){
                    if( err ){ return callback(err); }
                    if( resp.status === 'success' ){
                        resp.user = self.getPublic(resp.user);
                    }
                    return callback(null, resp);
                });
            } else {
                callback(null, {status: 'success', user: self.getPublic(user)});
            }
        });
    }

/*******************************************************************************

                POSTS

*******************************************************************************/

    /**
        Required:
            options.userId
        Optional:
            options.page
            options.tags (an array of user tag names)
            options.sortField (either 'date' or 'ranking')
    */
    model.getPosts = function(options, callback){
        var self = this;
        var page = options.page ? options.page : 1;
        var sortField = (options.sortField && options.sortField === 'ranking') ?
                        'ranking' : 'date';
        this.get(options.userId, function(err, user){
            if( err ){
                callback(err);
                return;
            }
            if( user.feeds.length === 0 ){
                callback(null, []);
                return;
            }
            var feedIds = user.feeds;
            if( options.tags ){
                feedIds = [];
                _.each(options.tags, function(tag){
                    if( user.tags[tag] ){
                        feedIds = feedIds.concat(user.tags[tag]);
                    }
                });
                feedIds = _.uniq(feedIds);
            }
            models.post.getFromFeeds({  feedIds: feedIds,
                                        page: page,
                                        sortField: sortField    },

                                     callback);
        });
    }


/*******************************************************************************

                FEEDS

*******************************************************************************/

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
            // remove from tags
            user.tags = _.map(user.tags, function(feedIds){
                return _.filter(feedIds, function(feedId){
                    return feedId !== options.feedId;
                })
            })

            self.update(user, function(err){
                if( err ){ callback(err); }
                else{ callback(); }
            });
        })
    }

/*******************************************************************************

                TAGS

*******************************************************************************/

    /**
        Required:
            options.userId
            options.tagName
    */
    model.addTag = function(options, callback){
        var self = this;
        if( !self._tagIsValid(options.tagName) ){
            return callback(null, errors.invalidTag);
        }
        self.get(options.userId, function(err, user){
            if( err ){ return callback(err); }
            if( user.tags[options.tagName] ){
                return callback(null, {status: 'success'});
            }
            user.tags[options.tagName] = [];
            self.update(user, function(err){
                if( err ){ return callback(err); }
                callback(null, {status: 'success'})
            });
        });
    }

    /**
        Required:
            options.userId
            options.tagName
    */
    model.removeTag = function(options, callback){
        var self = this;
        self.get(options.userId, function(err, user){
            if( err ){ return callback(err); }
            if( !user.tags[options.tagName] ){
                return callback(null, {status: 'success'});
            }
            user.tags = _.filter(user.tags, function(feeds, tagName){
                return tagName !== options.tagName;
            });
            self.update(user, function(err){
                if( err ){ return callback(err); }
                callback(null, {status: 'success'})
            });
        });
    }

    /**
        Required
            options.userId
            options.tagName
            options.feedId
    */
    model.addFeedToTag = function(options, callback){
        var self = this;
        self.get(options.userId, function(err, user){
            if( err ){ return callback(err); }

            // confirm tag exists
            if( !_.isArray(user.tags[options.tagName]) ){
                return callback(null, errors.tagDoesNotExist);
            }

            // if user does not already have feed, add it
            if( !_.contains(user.feeds, options.feedId) ){
                user.feeds.push(options.feedId);
            }

            user.tags[options.tagName].push(options.feedId);
            self.update(user, function(err){
                if( err ){ return callback(err); }
                callback(null, {status: 'success'});
            });
        });
    }

    model._tagIsValid = function(tagName){
        if( !tagName ||
            !tagName.length ||
            tagName.length < 2 ||
            tagName.length > 32 ){ return false; }
        return true;
    }



/*******************************************************************************

                HELPERS

*******************************************************************************/

    model._emailIsValid = function(email){
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    return model;
}