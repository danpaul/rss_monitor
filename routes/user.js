// var auth = new require('../lib/auth');
var Auth = require('../lib/auth');
var auth = new Auth;
var errors = require('../lib/errors');
var express = require('express');
var route = express();

module.exports = function(app){
    var models = app.models;

    var getDefaultFields = function(req){
        var email = req.body.email ? req.body.email : '';
        var password = req.body.password ? req.body.password : '';
        return {email: email, password: password};
    }

    // session test
    route.get('/test', function(req, res){
        console.log(req.session);
        req.session.foo = 'bar';
        res.send('ok');
    });

    route.get('/', function(req, res){
        var self = this;
        if( !auth.check(req, res) ){ return; }
        models.user.getPublicUser(req.session.userId, function(err, resp){
            if( err ){ return res.json(errors.serverError); }
            res.json(resp);
        })
    });

    /**
        Create new user
    */
    route.post('/', function(req, res){
        var self = this;
        models.user.createNew(getDefaultFields(req), function(err, resp){
            if( err ){ return res.json(errors.serverError); }
            return res.json(resp);
        });
    });

    route.post('/login', function(req, res){
        var self = this;
        models.user.login(getDefaultFields(req), function(err, resp){
            if( err ){ return res.json(errors.serverError); }
            if( resp.status === 'success' ){
                auth.login(req, resp.user.id);
            }
            return res.json(resp);
        });
    });

    route.post('/logout', function(req, res){
        auth.logout(req);
        res.json({status: 'success'});
    });

    return route;
}