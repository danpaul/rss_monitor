var express = require('express');
var route = express();

module.exports = function(app){
    var models = app.models;

    var getDefaultFields = function(req){
        var email = req.body.email ? req.body.email : '';
        var password = req.body.password ? req.body.password : '';
        return {email: email, password: password};
    }

    var isLoggedIn = function(req){
        if( req &&
            req.session &&
            req.session.userId ){ return true; }
        return false;
    }

    var serverError = {status: 'error',
                       message: 'A server error occured'};

    // session test
    route.get('/test', function(req, res){
        console.log(req.session);
        req.session.foo = 'bar';
        res.send('ok');
    });

    route.get('/', function(req, res){
        if( !isLoggedIn(req) ){
            return res.json({status: 'failure', message: 'User is not logged in'});
        }
        models.user.getPublicUser(req.session.userId, function(err, resp){
            if( err ){ return res.json(serverError); }
            res.json(resp);
        })
    });

    /**
        Create new user
    */
    route.post('/', function(req, res){
        var email = req.body.email ? req.body.email : '';
        var password = req.body.password ? req.body.password : '';
        models.user.createNew(getDefaultFields(req), function(err, resp){
            if( err ){ return res.json(serverError); }
            return res.json(resp);
        });
    });

    route.post('/login', function(req, res){
        models.user.login(getDefaultFields(req), function(err, resp){
            if( err ){ return res.json(serverError); }
            if( resp.status === 'success' ){
                req.session.userId = resp.user.id;
            }
            return res.json(resp);
        });
    });

    route.post('/logout', function(req, res){
        req.session.destroy();
        res.json({status: 'success'});
    });

    return route;
}