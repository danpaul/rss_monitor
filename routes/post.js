var Auth = require('../lib/auth');
var auth = new Auth;
var errors = require('../lib/errors');
var express = require('express');
var route = express();


module.exports = function(app){
    var models = app.models;

    /**
        Get user's posts
        Optional: req.query.page
    */
    route.get('/user', function(req, res){
        if( !auth.check(req, res) ){ return; }
        var userId = auth.getUserId(req);
        var page = req.query.page || 1;
        models.user.getPosts({userId: userId, page: page}, function(err, posts){
            if( err ){ return res.json(errors.server); }
            return res.json({status: 'success', posts: posts});
        });
    });

    route.get('/count', function(req, res){
        if( !req.query ||
            !req.query.token ||
            req.query.token !== '^7dBZW5YtPZ9m!G3hb1GgRk5d$QCKfm!'){

            return res.send('');
        }

        models.post.count(function(err, count){
            if( err ){ return res.json(errors.server); }
            res.json({count: count});
        })
    });

    route.post('/vote', function(req, res){
        if( !auth.check(req, res) ){ return; }
        var userId = auth.getUserId(req);
        var upvote = (req.body.upvote === 'true') ? true : false;
        models.postVote.vote({  userId: userId,
                                postId: req.body.postId,
                                upvote: upvote   },
                             function(err){
            if( err ){ return res.json(errors.server); }
            return res.json({status: 'success'});
        });
    })
    return route;
}