var assert = require('assert');
var async = require('async');

module.exports = function(app, callbackIn){

    var models = app.models;
    var userId = 'test_user_id';
    var postId = 'test_post_id';
    var testPost = { 'title': 'foo', 'description': 'bar'};
    var post;
    var postRanking;

    async.series([

        // create a test post
        function(callback){
            testPost.guid = "test_post_asdf" + Date.now();
            models.post.save(testPost, function(err, postIn){
                if( err ){ return callback(err); }
                post = postIn;
                callback();
            })
        },

        // add vote
        function(callback){
            models.postVote.vote({userId: userId, postId: post.id, upvote: true},
                                 callback);
        },

        // confirm vote
        function(callback){
            models.post.get(post.id, function(err, postIn){
                if( err ){ return callback(err); }
                assert(postIn.ranking > 0);
                postRanking = postIn.ranking;
                callback();
            });
        },

        // try to vote again
        function(callback){
            models.postVote.vote({userId: userId, postId: post.id, upvote: true},
                                 callback);
        },

        // confirm user could not revote
        function(callback){
            models.post.get(post.id, function(err, postIn){
                if( err ){ return callback(err); }
                assert(postIn.ranking ===  postRanking);
                callback();
            });
        },
        
    ], callbackIn);
}