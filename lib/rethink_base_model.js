var _ = require('underscore');
var path = require('path');
var r = require('rethinkdb');

/**
    Should be extended.

    Exaple usage:

    var BaseModel = require('../lib/rethink_base_model');
    var baseModel = new BaseModel;

    module.exports = function(app){
        // app should have app.connection and app.models property
        baseModel.extend(this, app, __filename);
    }
*/
var base = function(child, app, filename){
    this.models = app.models;
    this.connection = app.connection;
    this.name = path.basename(filename).replace(/\.[^/.]+$/, "");
};

/**
    callback(err, `obj`)
    callsback with obj id added to `obj` after creation
*/
base.prototype.create = function(obj, callback){
    _.each(this.defaults, function(v, k){
        if( typeof(obj[k]) === 'undefined' ){ obj[k] = v; }
    })
    r.table(this.name)
     .insert([obj])
     .run(this.connection, function(err, result){
        if( err ){
            callback(err);
        } else {
            obj.id = result.generated_keys[0];
            callback(null, obj);
        }
    })
}

/**
    get by ID
    callback(err, `obj`)
*/
base.prototype.get = function(id, callback){
    r.table(this.name).get(id).run(this.connection, callback);
}


/**

    Required:
        options.row
        options.value
*/
base.prototype.filter = function(options, callback){
    r.table(this.name).filter(r.row(options.row).eq(options.value))
     .run(this.connection, function(err, cursor) {
            if( err ){
                callback(err);
            } else {
                cursor.toArray(callback);
            }
        });
}

/**

    Required:
        options.row
        options.value
*/
base.prototype.hasItem = function(options, callback){
    this.filter(options, function(err, rows){
        if( err ){
            callback(err);
        } else {
            callback(null, (rows.length > 0));
        }
    });
}

/**
    required: options.id
*/
base.prototype.update = function(options, callback){
    r.table(this.name).get(options.id)
        .update(options)
        .run(this.connection, callback);
}

base.prototype.delete = function(id, callback){
    r.table(this.name).get(id)
        .delete()
        .run(this.connection, callback);
}

module.exports = base;