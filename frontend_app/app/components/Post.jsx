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
console.log(this.props.post)

        var img = ' ';
        if( this.props.post.postImage ){
            img = <img src={this.props.post.postImage} />
        }

        return <row>
            <column cols="2" className="post-image-wrap">
                <a
                    href={this.props.post.link}
                    target="_blank">
                    {img}
                </a>
            </column>
            <column cols="10">
                <a
                    href={this.props.post.link}
                    target="_blank">
                    <h4>{this.props.post.title}</h4>
                </a>
            </column>
        </row>;
    }
});
module.exports = Post;