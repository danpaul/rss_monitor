var assert = require('assert');
var async = require('async');

module.exports = function(app, callbackIn){

    var models = app.models;

    var TEST_USER_ID = 'TEST_USER_ID';
    var TEST_POST_ID = 'TEST_POST_00';
    var TEST_POSTS_ARRAY = ['TEST_POST_01', 'TEST_POST_02', 'TEST_POST_03'];

    async.series([

        // create a test post
        function(callback){
            models.savedPost.save({userId: TEST_USER_ID, postId: TEST_POST_ID},
                                  callback);
        },
        // confirm that we can not create a duplicate record
        function(callback){
            models.savedPost.save({userId: TEST_USER_ID, postId: TEST_POST_ID},
                                  callback);
        },
        function(callback){
            models.savedPost.getUserPosts({userId: TEST_USER_ID},
                                          function(err, savedPosts){
                if( err ){ return callback(err); }
                assert(savedPosts.length === 1,
                       'There should be exactly one saved post');
                callback();
            });
        },
        function(callback){
            models.savedPost.delete({
                                        userId: TEST_USER_ID,
                                        postId: TEST_POST_ID    },
                                     callback);
        },
        function(callback){
            models.savedPost.getUserPosts({userId: TEST_USER_ID},
                                          function(err, savedPosts){
                if( err ){ return callback(err); }
                assert(savedPosts.length === 0,
                       'Saved post was not deleted');
                callback();
            });
        },
        function(callback){
            models.savedPost.save({ userId: TEST_USER_ID,
                                    postIds: TEST_POSTS_ARRAY   },
                                  callback);
        },
        function(callback){
            models.savedPost.getUserPosts({userId: TEST_USER_ID},
                                          function(err, savedPosts){
                if( err ){ return callback(err); }
                assert(savedPosts.length === 3,
                       'There should be exactly three saved post');
                callback();
            });
        },
        function(callback){
            models.savedPost.delete({
                                        userId: TEST_USER_ID,
                                        postIds: TEST_POSTS_ARRAY   },
                                     callback);
        },
        function(callback){
            models.savedPost.getUserPosts({userId: TEST_USER_ID},
                                          function(err, savedPosts){
                if( err ){ return callback(err); }
                assert(savedPosts.length === 0,
                       'Saved posts were not deleted');
                callback();
            });
        }
    ], callbackIn);

}