var Auth = require('../lib/auth');
var auth = new Auth;
var errors = require('../lib/errors');
var express = require('express');
var route = express();

module.exports = function(app){
    var models = app.models;
    route.get('/', function(req, res){
        if( !auth.check(req, res) ){ return; }
        var userId = auth.getUserId(req);
        models.userPostLog.getLog({userId: userId}, function(err, logs){
            if( err ){ return res.json(errors.server); }
            return res.json({status: 'success', logs: logs});
        });
    });
    /**
        Required:
            Either:
                req.body.postId (single ID)
                req.body.posts (an array of IDs)

    */
    route.post('/', function(req, res){
        if( !auth.check(req, res) ){ return; }
        var userId = auth.getUserId(req);

        if( req.body.postId ){
            var posts = [req.body.postId];
        } else {
            var posts = req.body.posts;
        }
        if( !posts ){ return res.json(errors.invalidParameters); }

        models.userPostLog.addMultiple({userId: userId, posts: posts},
                               function(err, logs){
            if( err ){ return res.json(errors.server); }
            return res.json({status: 'success'});
        });
    });
    return route;
}