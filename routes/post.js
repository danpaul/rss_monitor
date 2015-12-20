module.exports = function(app){
    app.get('/post/test', function(req, res){ res.send('ok'); });
}