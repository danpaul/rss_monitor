module.exports = function(app){
    app.get('/feed/test', function(req, res){ res.send('ok'); });
}