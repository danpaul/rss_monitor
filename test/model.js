var assert = require('assert');
var async = require('async');

// generic base model method test
var MODEL_NAME = 'example';

module.exports = function(app, callbackIn){

    if( !app.models[MODEL_NAME] ){
        throw new Error('Update `MODEL_NAME` in test/index.js. `' +
                        MODEL_NAME + '` not found.');
    }

    var model = app.models[MODEL_NAME];
    var modelId;

    async.series([
        // create
        function(callback){
            model.create({foo: 'bar', baz: true, bat: 88}, function(err, newModel){
                if( err ){
                    callback(err);
                    return;
                }
                modelId = newModel.id;
                callback();
            });
        },
        // get
        function(callback){
            model.get(modelId, function(err, newModel){
                if( err ){
                    callback(err);
                    return;
                }
                assert(newModel.foo === 'bar');
                assert(newModel.baz === true);
                assert(newModel.bat === 88);
                // check default field
                assert(newModel.defaultField === true);

                callback();
            });
        },
        // update
        function(callback){
            model.update({id: modelId, bat: 90}, function(err, newModel){
                if( err ){
                    callback(err);
                    return;
                }
                model.get(modelId, function(err, newModel){
                    if( err ){
                        callback(err);
                        return;
                    }
                    assert(newModel.bat === 90);
                    callback();
                });
            });
        },
        // delete
        function(callback){
            model.delete(modelId, function(err, newModel){
                if( err ){
                    callback(err);
                    return;
                }
                model.get(modelId, function(err, newModel){
                    if( err ){
                        callback(err);
                        return;
                    }
                    assert(newModel === null);
                    callback();
                });
            });
        },
    ], callbackIn);
}