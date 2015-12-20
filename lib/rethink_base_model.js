var r = require('rethinkdb');

/**
    Should be extended.

    Interface
        Object extending this one shoud have `name`(string) and
            `connection`(rethink connection) properties
*/
var base = function(){};
base.prototype.foo = function(){ cnosole.log('in foo'); };

/**
    callback(err, `obj`)
    callsback with obj id added to `obj` after creation
*/
base.prototype.create = function(obj, callback){
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
    callback(err, `obj`)
*/
base.prototype.get = function(id, callback){
    r.table(this.name).get(id).run(this.connection, callback);
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