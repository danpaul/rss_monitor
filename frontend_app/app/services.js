/**
    Methods guarantee a response object:
        {status: ['success', 'failure', 'error']}

*/
var _ = require('underscore');
var $ = require('jquery');
var config = require('./config');

var services = {};
var SERVER_ERROR = {status: 'error', message: 'A server error occurred'};

services.makeRequest = function(type, url, data, callback){
    var requestObject = {
        type: type,
        url: url,
        dataType: 'JSON'
    }
    if( data ){ requestObject.data = data; }
    if( config.debug ){
        console.log('Request: ', requestObject);
    }
    requestObject.success = function(resp){
        if( config.debug ){
            console.log('Response: ', resp);
        }
        callback(resp);
    }
    requestObject.error = function(err){
        console.log('Services error: ', err);
        callback(SERVER_ERROR);
    }
    $.ajax(requestObject);
}
services._formatPosts = function(resp, callback){
    if( resp.status !== 'success' ){ return(call(resp)); }
    resp.posts = _.map(resp.posts, function(post){
        post.link = post.link || '';
        post.title = post.title || '';
        return post;
    });
    callback(resp);
}
services.login = function(options, callback){
    services.makeRequest('POST',
                         config.rootUrl + '/user/login',
                         {email: options.email, password: options.password},
                         callback);
}
services.logout = function(callback){
    services.makeRequest('POST',
                         config.rootUrl + '/user/logout',
                         null,
                         callback);
}
services.register = function(options, callback){
    services.makeRequest('POST',
                         config.rootUrl + '/user',
                         {email: options.email, password: options.password},
                         callback);
}
services.getUser = function(callback){
    services.makeRequest('GET',
                         config.rootUrl + '/user',
                         null,
                         callback);
}
services.addFeed = function(options, callback){
    services.makeRequest('POST',
                         config.rootUrl + '/feed',
                         {url: options.url},
                         callback);
}
services.removeFeed = function(options, callback){
    services.makeRequest('POST',
                         config.rootUrl + '/user/remove-feed/' + options.feedId,
                         null,
                         callback);
}
services.getUserFeeds = function(callback){
    services.makeRequest('GET',
                         config.rootUrl + '/user/feeds',
                         {format: 'object'},
                         callback);
}
services.getUserPostLog = function(callback){
    services.makeRequest('GET',
                         config.rootUrl + '/log',
                         null,
                         callback);
}
services.getUserPosts = function(options, callback){
    var self = this;
    var page = options.page ? options.page : 1;
    services.makeRequest('GET',
                         config.rootUrl + '/post/user',
                         {page: page},
                         function(resp){ self._formatPosts(resp, callback); });
}
// Required: options.posts (an array of postIds)
services.addPostsToLog = function(options, callback){
    services.makeRequest('POST',
                         config.rootUrl + '/log',
                         {posts: options.posts},
                         callback);
}
/**
    Required:
        options.upVote (boolean, true if upvote)
        options.postId
*/
services.postVote = function(options, callback){
    services.makeRequest('POST',
                         config.rootUrl + '/post/vote',
                         {postId: options.postId, upvote: options.upvote},
                         callback);
}
module.exports = services;