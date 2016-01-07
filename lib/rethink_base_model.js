var _ = require('underscore');
var path = require('path');
var r = require('rethinkdb');

/**
    Should be extended.

    Example usage:

        var BaseModel = require('../lib/rethink_base_model');

        module.exports = function(app){

            var model = new BaseModel(this, app, __filename);

            // set model defaults
            model.defaults  = {defaultField: true}

            // defines the rethink indexes
            model.indexes = ['mostRecent', 'timestamp', {compound_index: ['field_one', 'field_two']}];

            return model;
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

base.prototype.count = function(callback){
    r.table(this.name).count().run(this.connection, callback)
}

base.prototype.getAll = function(callback){
    r.table(this.name).coerceTo('array').run(this.connection, callback);
}

/**
    Required:
        ids: an arry of ids
*/
base.prototype.getAllFromArray = function(ids, callback){
    if( ids.length > 1 ){
        r.table(this.name).getAll(r.args(ids)).coerceTo('array')
            .run(this.connection, callback);        
    } else if( ids.length === 1 ) {
        r.table(this.name).getAll(ids[0]).coerceTo('array')
            .run(this.connection, callback);
    } else {
        callback(null, []);
    }
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
        if( err ){ return callback(err); }
        callback(null, (rows.length > 0));
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

base.prototype.getPublic = function(modelObject){
    var publicObject = {};
    _.each(this.publicFields, function(field){
        if( typeof(modelObject[field]) !== 'undefined' ){
            publicObject[field] = modelObject[field];
        }
    })
    return publicObject;
}

module.exports = base;