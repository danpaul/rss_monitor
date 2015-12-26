var express = require('express');
var route = express();

module.exports = function(app){
    // this route will be available at `/example/test`
    route.get('/test', function(req, res){ res.send('ok'); });
    return route;
}