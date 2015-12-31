var _ = require('underscore');
var React = require('react');

var UserPosts = React.createClass({
    readPosts: [],
    postQueue: [],
    getInitialState: function(){
        return {};
    },
    componentDidMout: function(){
        
    },
    render: function(){
        var self = this;
        if( !this.props.visible ){ return null; }

        return <div>
user posts
        </div>
    }
});
module.exports = UserPosts;