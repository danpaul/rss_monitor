var async = require('async');

module.exports = function(app, callbackIn){
    app.testData = {};
    async.series([
        function(callback){ require('./model')(app, callback); },
        function(callback){ require('./feed')(app, callback); },
        function(callback){ require('./user')(app, callback); },
        function(callback){
            delete app.testData;
            callback();
        }
    ], callbackIn);
}