var Auth = require('../lib/auth');
var auth = new Auth;
var errors = require('../lib/errors');
var express = require('express');
var route = express();

module.exports = function(app){

    var models = app.models;


    // this route will be available at `/example/test`
    route.get('/test', function(req, res){ res.send('ok'); });

    // add feed
    route.post('/', function(req, res){
        if( !auth.check(req, res) ){ return; }
        var url = req.body.url || '';
        var userId = auth.getUserId(req);

        // add and activate
        models.feed.addAndActivate({url: url}, function(err, resp){
            if( err ){ return res.json(errors.server); }
            if( resp.status !== 'success' ){ return res.json(resp); }
            models.user.addFeed({userId: userId, feedId: resp.feed.id},
                                function(err){
                if( err ){ return res.json(errors.server); }
                return res.json({status: 'success'});
            });
        });
    });

    // follow existing feed


    return route;
}