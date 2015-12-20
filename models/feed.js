var _ = require('underscore');
var BaseModel = require('../lib/rethink_base_model');
var baseModel = new BaseModel;

module.exports = function(app){
    // extend base model (provides crud methods)
    _.extend(this, baseModel);

    var models = app.models;

    // props required by base model interface
    this.name = 'feed';
    this.connection = app.connection;

    // defines the rethink indexes
    this.indexes = ['url', 'mostRecent'];

    return this;
}