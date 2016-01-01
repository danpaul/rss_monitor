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
        // var htmlDiv = {__html: this.props.post.summary};
        // <div dangerouslySetInnerHTML={htmlDiv} />
        return <div>
            <a
                href={this.props.post.link}
                target="_blank">
                <h4>{this.props.post.title}</h4>
            </a>
        </div>;
    }
});
module.exports = Post;