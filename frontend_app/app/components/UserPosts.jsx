var _ = require('underscore');
var Post = require('./Post.jsx');
var React = require('react');

var UserPosts = React.createClass({
    readPosts: {},
    postQueue: [],
    page: 1,
    settings: {
        minPostsInQueue: 40,
        postsPerPage: 20
    },
    getInitialState: function(){
        return {
            reachedEnd: false,
            visiblePosts: [],
            positionInQueue: 0,
            postPage: 1
        };
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
                return self.setState({reachedEnd: true});
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
        var nextPosts = this.getNextPostSlice();
        this.setState({visiblePosts: nextPosts}, callback);
    },
    getNextPostSlice: function(){
        var start = (this.state.postPage - 1) * this.settings.postsPerPage; 
        var end = this.state.postPage * this.settings.postsPerPage;
        return this.postQueue.slice(start, end);
    },
    handleNextClick: function(){
        var self = this;
        var previousPostIds = _.map(this.state.visiblePosts, function(post){
            return post.id;
        });
        this.addPostsToRead(previousPostIds);
        this.props.services.addPostsToLog({posts: previousPostIds},
                                          function(resp){
            if(resp.status !== 'success'){
                console.log('Error saving postst to log:', resp);
            }
        })
        this.setState({postPage: this.state.postPage + 1}, function(){
            self.loadPagePosts(self.loadPosts);
        });
    },
    handleBackClick: function(){
        var self = this;
        if( this.state.postPage < 2 ){ return; }
        this.setState({postPage: this.state.postPage - 1}, function(){
            self.loadPagePosts();
        });
    },
    render: function(){
        var self = this;
        var prevButtonProps = {
            type: 'black',
            onClick: self.handleBackClick
        };
        var nextButtonProps = {
            type: 'black',
            onClick: self.handleNextClick
        };
        if( this.state.postPage <= 1 ){
            prevButtonProps.disabled = true;
        }
        if( !this.props.visible ){ return null; }
        return <div>
            {this.state.visiblePosts.map(function(post){
                return <Post
                    key={post.id}
                    post={post} />;
            })}
            <button{ ...prevButtonProps }>Prev</button>
            <button{ ...nextButtonProps }>Next</button>
        </div>
    }
});
module.exports = UserPosts;