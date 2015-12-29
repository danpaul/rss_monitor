var assert = require('assert');
var async = require('async');
var request = require('request');
request.defaults({jar: true});

module.exports = function(app, callbackIn){

    var rootUrl = app.config.rootUrl;
    var email = 'foo_' + Date.now() + '@email.com';
    var password = 'Asdfasdf';
    var user;

    var cookieJar = request.jar();

    async.series([

        // create user
        function(callback){

            request.post({uri: rootUrl + '/user',
                          form: {email: email, password: password},
                          jar: cookieJar
                      },
                         function(err, httpResponse, body){
                if( err ){ callback(err);
                } else {
                    body = JSON.parse(body);
                    assert(body.status === 'success');
                    assert(body.user.email === email);
                    user = body.user;
                    callback();
                }
            });
        },

        // login user
        function(callback){
            request.post({uri: rootUrl + '/user/login',
                          form: {email: email, password: password},
                          jar: cookieJar },
                         function(err, httpResponse, body){
                if( err ){ callback(err);
                } else {
                    body = JSON.parse(body);
                    assert(body.status === 'success');
                    callback();
                }
            });
        },

        // confirm user is logged in
        function(callback){
            request.get({uri: rootUrl + '/user', jar: cookieJar },
                        function(err, httpResponse, body){

                if( err ){ callback(err);
                } else {
                    body = JSON.parse(body);
                    assert(body.status === 'success');
                    assert(body.user.id === user.id);
                    callback();
                }
            });
        },
        // logout user
        function(callback){
            request.post({uri: rootUrl + '/user/logout',
                          jar: cookieJar },
                         function(err, httpResponse, body){
                if( err ){ callback(err);
                } else {
                    body = JSON.parse(body);
                    assert(body.status === 'success');
                    callback();
                }
            });
        },
        // confirm user is logged out
        function(callback){
            request.get({uri: rootUrl + '/user', jar: cookieJar },
                        function(err, httpResponse, body){

                if( err ){ callback(err);
                } else {
                    body = JSON.parse(body);
                    assert(body.status === 'failure');
                    callback();
                }
            });
        }
    ], callbackIn);
}