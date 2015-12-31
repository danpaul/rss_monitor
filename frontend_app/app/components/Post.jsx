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
    render: function(){
        return <div>
            <a
                href={this.props.post.link}
                target="_blank">
                {this.props.post.title}
            </a>
        </div>;
    }
});
module.exports = Post;