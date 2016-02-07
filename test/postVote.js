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
            models.post.save(testPost, {}, function(err, postIn){
                if( err ){ return callback(err); }
                post = postIn;
                callback();
            })
        },

        // confirm initial ranking is greater than zero
        function(callback){
            models.post.get(post.id, function(err, postIn){
                if( err ){ return callback(err); }
                assert(postIn.ranking > 0,
                       'Initial post ranking should be greater than zero.');
                postRanking = postIn.ranking;
                callback();
            });
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
                assert(postRanking < postIn.ranking,
                       'Post ranking after vote should be higher.');
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

        // wait than run an update of all rankings
        function(callback){
            setTimeout(function(){
                models.post.updateRankings({}, callback);
            }, 2000);
        },

        // confirm ranking has declined
        function(callback){
            models.post.get(post.id, function(err, postIn){
                if( err ){ return callback(err); }
                assert(postRanking > postIn.ranking,
                       'Ranking should have declined after update.');
                callback();
            });
        }
        
    ], callbackIn);
}