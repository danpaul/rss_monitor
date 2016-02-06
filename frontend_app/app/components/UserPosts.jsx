var _ = require('underscore');
var $ = require('jquery');
var Post = require('./Post.jsx');
var React = require('react');
var config = require('../config');

var UserPosts = React.createClass({
    readPosts: {},
    postQueue: [],
    page: 1,
    isLoading: false,
    postsToLog: [],
    logLastUpdated: null,
    settings: {
        minPostsInQueue: 40,
        postsPerPage: 20,
        pageBottomeOffset: 100,
        scrollCheckTime: 1000, // frequency to check which posts the user has already viewed
        updateLogTime: 10000 // frequency to update user viewed log on the server
    },
    getInitialState: function(){
        window.onscroll = this.handleScroll;    
        return {
            reachedEnd: false,
            visiblePosts: [],
            positionInQueue: 0,
            postPage: 1
        };
    },
    handleScroll: function(){
        var self = this;
        if($(window).scrollTop() + $(window).height() >
            $(document).height() - this.settings.pageBottomeOffset) {

            if( this.isLoading ){ return; }
            this.isLoading = true;
            this.setState({postPage: this.state.postPage + 1}, function(){                
                self.loadPagePosts(function(){
                    self.loadPosts();
                    self.isLoading = false;
                });
            });
       }
    },
    componentDidMount: function(){
        var self = this;
        this.props.services.getUserPostLog(function(resp){
            if( resp.status !== 'success'){
                return alert(resp.message);
            }
            self.addPostsToRead(resp.logs);
            self.loadPosts();
        });
        this.logLastUpdated = Date.now();
        setInterval(function(){
            _.each($('.post-wrap'), function(postDiv){
                var id = $(postDiv).data('postid');
                if( self.postHasBeenScrolledPast(postDiv) &&
                    !self.readPosts[id] ){
                    self.addPostsToRead([id]);
                    // self.readPosts[id] = true;
                    self.postsToLog.push(id);
                    if( config.debug ){
                        console.log('Adding post to viewed log:',
                                    $(postDiv).data('title'));
                    }                    
                }
            })
            self.postViewedLog();
        }, this.settings.scrollCheckTime)
    },
    postViewedLog: function(){
        // check time
        if( Date.now() - this.logLastUpdated < this.settings.updateLogTime ){
            return;
        }
        var postsToLog = this.postsToLog.slice();
        this.postsToLog = [];
        this.logLastUpdated = Date.now();

        if( postsToLog.length === 0 ){
            if( config.debug ){ console.log('No posts to log'); }
            return;
        }

        if( config.debug ){
            console.log('Logging posts: ', postsToLog);
        }
        this.props.services.addPostsToLog({posts: postsToLog},
                                          function(resp){
            if(resp.status !== 'success'){
                console.log('Error saving postst to log:', resp);
            }
        })
    },
    postHasBeenScrolledPast: function(el){
        return( $(el).position().top < $(document).scrollTop() );
    },
    // takes an array of post IDS or single ID
    addPostsToRead: function(postIds){
        var self = this;
        if( !_.isArray(postIds) ){ return self.readPosts[postIds] = true; }
        _.each(postIds, function(postId){ self.readPosts[postId] = true; });
    },
    // loads posts into the queue
    loadPosts: function(){
        var self = this;
        if( self.hasEnoughPostsInQueue() ){ return; }
        self.props.services.getUserPosts({page: self.page}, function(resp){
            if( resp.status !== 'success' ){
                return alert(resp.message);
            }
            if( resp.posts.length === 0 ){
                return self.setState({reachedEnd: true}, function(){
                    self.loadPagePosts();
                });
            }
            _.each(resp.posts, function(post){
                if( !self.readPosts[post.id] ){
                    var hasPost = false;
                    _.each(self.postQueue, function(p){
                        if(p.id === post.id){hasPost = true}
                    });
                    if( !hasPost ){ self.postQueue.push(post); }
                }
            })
            self.page += 1;
            
            if( self.hasEnoughPostsInQueue() ){
                self.loadPagePosts();
            } else {
                self.loadPosts();
            }

        });
    },
    hasEnoughPostsInQueue: function(){
        return( this.postQueue.length - this.state.positionInQueue >
                this.settings.minPostsInQueue ||
                this.state.reachedEnd );
    },
    loadPagePosts: function(callbackIn){
        var callback = callbackIn || function(){};
        var newPosts = this.state.visiblePosts.concat(this.getNextPostSlice());
        newPosts = _.uniq(newPosts);
        this.setState({visiblePosts: _.uniq(newPosts)}, callback);
    },
    getNextPostSlice: function(){
        var start = (this.state.postPage - 1) * this.settings.postsPerPage; 
        var end = this.state.postPage * this.settings.postsPerPage;
        return this.postQueue.slice(start, end);
    },
    handleVote: function(postId, isUpvote, callback){
        this.props.services.postVote({postId: postId, upvote: isUpvote},
                                     callback);
    },
    render: function(){
        if( !this.props.visible ){ return null; }
        return <div>
            {this.state.visiblePosts.map(function(post){
                return <Post
                    key={post.id}
                    post={post}
                    handleVote={self.handleVote} />;
            })}
        </div>
    }
});
module.exports = UserPosts;