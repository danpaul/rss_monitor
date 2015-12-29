var r = require('rethinkdb');

/**
    Keep this as a tempalte and for testing(`../test/model.js`)

    Properties instantiated by baseMode:
        + this.models (all models)
        + this.connection (rethinkdb connection)
        + this.modelName (filename without the extension/rethink table name)

    See `rethink_base_model.js` for methods exposed (i.e. CRUD)
*/

var BaseModel = require('../lib/rethink_base_model');

module.exports = function(app){

    var model = new BaseModel(this, app, __filename);

    // set model defaults
    model.defaults  = {defaultField: true}

    // defines the rethink indexes
    model.indexes = ['mostRecent', 'timestamp', {compound_index: ['field_one', 'field_two']}];

    // used for .getPublic method
    model.publicFields = ['foo', 'bar'];

    return model;
}