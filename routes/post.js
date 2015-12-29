var Auth = require('../lib/auth');
var auth = new Auth;
var errors = require('../lib/errors');
var express = require('express');
var route = express();


module.exports = function(app){
    var models = app.models;

    route.get('/user', function(req, res){
        if( !auth.check(req, res) ){ return; }
        var userId = auth.getUserId(req);
        var page = req.query.page || 1;
        models.user.getPosts({userId: userId, page: page}, function(err, posts){
            if( err ){ return res.json(errors.server); }
            return res.json({status: 'success', posts: posts});
        });
    });
    return route;
}