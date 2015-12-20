module.exports = function(app){
    var models = app.models;
    models.feed = {
        // todo: add indexes
        indexes: ['url', 'mostRecent']
    };
}