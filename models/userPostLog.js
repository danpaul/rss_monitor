var BaseModel = require('../lib/rethink_base_model');
var r = require('rethinkdb');

module.exports = function(app){

    var model = new BaseModel(this, app, __filename);

    // set model defaults
    model.defaults  = {userId: '', postId: '', timestamp: 0};

    model.settings = {
        getLogLimit: 1000,
        logExpiry: 1000 * 60 * 60 * 24 * 7
    }

    model.init = function(){
        // watch and clear expired records

    }

    // defines the rethink indexes
    model.indexes = ['userId', 'timestamp', {userId_postId: ['userId', 'postId']}];

    /**
        Required:
            options.userId
            options.postId
    */
    model.add = function(options, callback){
        var self = this;
        model.hasRecord(options, function(err, hasRecord){
            if( err ){
                callback(err);
                return;
            }
            if( hasRecord ){
                callback();
                return;
            }
            options.timestamp = Date.now();
            self.create(options, callback);
        });
    }

    model.getLog = function(options, callback){
        r.table(this.name).getAll(options.userId, {index: 'userId'})
            .limit(this.settings.getLogLimit)
            .coerceTo('array')
            .run(this.connection, callback);
    }

    /**
        Required:
            options.userId
            options.postId
    */
    model.hasRecord = function(options, callback){
        r.table(this.name).getAll([options.userId, options.postId],
                                  {index: 'userId_postId'})
            .coerceTo('array')
            .run(this.connection, function(err, result){
                if( err ){ callback(err); }
                else{
                    callback(null, (result.length > 0));
                }
            });
    }

    model.init();
    return model;
}