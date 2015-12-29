var BaseModel = require('../lib/rethink_base_model');

module.exports = function(app){
    var model = new BaseModel(this, app, __filename);
    return model;
}