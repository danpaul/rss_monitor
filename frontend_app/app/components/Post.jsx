var React = require('react');

var Post = React.createClass({
    getInitialState: function(){
        return {};
    },
    handleDeleteClick: function(e){
        var self = this;
        var feedId = ($(e.target).data('feedid'));
        self.props.services.removeFeed({feedId: feedId}, function(resp){
            if( resp.status !== 'success' ){ return alert(resp.message); }
            self.props.updateFeeds();
        });
    },
    handleUpVote: function(){
        this.props.handleVote(this.props.post.id, true, this._voteCallback);
    },
    handleDownVote: function(){
        this.props.handleVote(this.props.post.id, false, this._voteCallback);
    },
    _voteCallback: function(err){
        if( err ){ return alert(err); }
        alert('vote counted');
    },
    render: function(){
        var img = ' ';
        if( this.props.post.postImage ){
            img = <img src={this.props.post.postImage} />
        }
        var pubDate = false;
        if( this.props.post.pubDate ){
            var date = new Date(this.props.post.pubDate);
            var pubDate = date.getFullYear() + '-' +
                          (date.getMonth() + 1) + '-' +
                          date.getDay();
            pubDate = '[' + pubDate + ']';
        }

        return <row>
            <column cols="1" className="post-vote-wrap">
                <div>
                    <a onClick={this.handleUpVote}>
                        <i className="fa fa-arrow-circle-o-up vote-arrow"></i>
                    </a>
                </div>
                <div>
                    {this.props.post.ranking}
                </div>
                <div>
                    <a onClick={this.handleDownVote}>
                        <i className="fa fa-arrow-circle-o-down"></i>
                    </a>
                </div>
            </column>
            <column cols="2" className="post-image-wrap">
                <a
                    href={this.props.post.link}
                    target="_blank">
                    {img}
                </a>
            </column>
            <column cols="9">
                <a
                    href={this.props.post.link}
                    target="_blank">
                    <h4>{this.props.post.title}</h4>
                </a>
                <div>
                    {pubDate ? pubDate : ''}
                    <a
                        href={this.props.post.feedUrl}
                        target="_blank">
                        <h6>{this.props.post.feedName}</h6>
                    </a>
                </div>
            </column>
        </row>;
    }
});
module.exports = Post;