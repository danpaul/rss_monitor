/**
    Methods guarantee a response object:
        {status: ['success', 'failure', 'error']}

*/

var config = require('./config');
var $ = require('jquery');

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
        console.log('Making request with data: ', requestObject);
    }
    requestObject.success = function(resp){
        if( config.debug ){
            console.log('Received response: ', resp);
        }
        callback(resp);
    }
    requestObject.error = function(err){
        console.log('Services error: ', err);
        callback(SERVER_ERROR);
    }
    $.ajax(requestObject);
}
services.login = function(options, callback){
    services.makeRequest('POST',
                         config.rootUrl + '/user/login',
                         {email: options.email, password: options.password},
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
services.getUserFeeds = function(callback){
    services.makeRequest('GET',
                         config.rootUrl + '/user/feeds',
                         {format: 'object'},
                         callback);
}

module.exports = services;