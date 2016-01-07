var r = require('rethinkdb');

/**
    Fields:
        userId
        postId
        upvote (boolean)
        timestamp (js timestamp)
*/

var BaseModel = require('../lib/rethink_base_model');

module.exports = function(app){

    var model = new BaseModel(this, app, __filename);
    var models = app.models;

    // set model defaults
    model.defaults  = {defaultField: true}

    // defines the rethink indexes
    model.indexes = [{user_post_vote: ['userId', 'postId']}];

    /**
        required:
            options.userId
            options.postId
            options.upvote (boolean)
    */
    model.vote = function(options, callback){
        var self = this;
        // confirm user has not yet voted
        r.table(this.name)
            .getAll([options.userId, options.postId], {index: 'user_post_vote'})
            .coerceTo('array')
            .run(this.connection, function(err, resp){
                if( err || resp.length !== 0 ){ return callback(err); }
                // update log
                self.create({   userId: options.userId,
                                postId: options.postId,
                                upvote: options.upvote,
                                timestamp: Date.now()   }, function(err){

                    if( err ){ return callback(err); }
                    models.post.vote({postId: options.postId, upvote: options.upvote},
                                     callback);
                });
        });
    }
    return model;
}