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
    route.post('/', function(req, res){
        if( !auth.check(req, res) ){ return; }
        var userId = auth.getUserId(req);
        var postId = req.params.postId;
        if( !postId ){ return res.json(errors.invalidPost); }
        models.userPostLog.add({userId: userId, postId: postId},
                               function(err, logs){
            if( err ){ return res.json(errors.server); }
            return res.json({status: 'success'});
        });
    });
    return route;
}