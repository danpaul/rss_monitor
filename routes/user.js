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
        models.user.getPublicUser(auth.getUserId(req), function(err, resp){
            if( err ){ return res.json(errors.server); }
            res.json(resp);
        })
    });

    /**
        Create new user
    */
    route.post('/', function(req, res){
        var self = this;
        models.user.createNew(getDefaultFields(req), function(err, resp){
            if( err ){ return res.json(errors.server); }
            return res.json(resp);
        });
    });

    // route.post('/login', function(req, res){
    //     var self = this;
    //     models.user.login(getDefaultFields(req), function(err, resp){
    //         if( err ){ return res.json(errors.server); }
    //         if( resp.status === 'success' ){
    //             auth.login(req, resp.user.id);
    //         }
    //         return res.json(resp);
    //     });
    // });

    // route.post('/logout', function(req, res){
    //     auth.logout(req);
    //     res.json({status: 'success'});
    // });

    route.post('/follow/:feedId', function(req, res){
        if( !auth.check(req, res) ){ return; }
        var userId = auth.getUserId(req);
        models.user.addFeed({userId: userId, feedId: req.params.feedId},
                            function(err){
            if( err ){ return res.json(errors.server); }
            return res.json({status: 'success'});
        })
    });

    /**
        optional:
            req.query.format: ['object'] - returns objects instead of ids
    */
    route.get('/feeds', function(req, res){
        if( !auth.check(req, res) ){ return; }
        var userId = auth.getUserId(req);
        models.user.get(userId, function(err, user){
            if( err ){ return res.json(errors.server); }
            if( !req.query || !req.query.format || req.query.format !== 'object' ){
                return res.json({status: 'success', feeds: user.feeds});
            }
            models.feed.getAllFromArray(user.feeds, function(err, feeds){
                if( err ){ return res.json(errors.server); }
                return res.json({status: 'success', feeds: feeds});
            });
        })
    });

    route.post('/remove-feed/:feedId', function(req, res){
        if( !auth.check(req, res) ){ return; }
        var userId = auth.getUserId(req);
        models.user.removeFeed({userId: userId, feedId: req.params.feedId},
                               function(err){
            if( err ){ return res.json(errors.server); }
            return res.json({status: 'success'});
        })
    });

    route.post('/tag', function(req, res){
        if( !auth.check(req, res) ){ return; }
        var userId = auth.getUserId(req);
        var tag = req.body.tag ? req.body.tag : '';
        models.user.addTag({tagName: tag, userId: userId}, function(err, resp){
            if( err ){ return res.json(errors.server); }
            res.json(resp);
        });
    });

    route.post('/delete-tag', function(req, res){
        if( !auth.check(req, res) ){ return; }
        var userId = auth.getUserId(req);
        var tag = req.body.tag ? req.body.tag : '';
        models.user.removeTag({tagName: tag, userId: userId}, function(err, resp){
            if( err ){ return res.json(errors.server); }
            res.json(resp);
        });
    });

    route.post('/add-feed-to-tag', function(req, res){
        if( !auth.check(req, res) ){ return; }
        var userId = auth.getUserId(req);
        var tagName = req.body.tag ? req.body.tag : '';
        var feedId = req.body.feedId ? req.body.feedId : '';

        models.user.addFeedToTag({  userId: userId,
                                    tagName: tagName,
                                    feedId: feedId}, function(err, resp){

            if( err ){ return res.json(errors.server); }
            return res.json(resp);
        });
    });

    return route;
}