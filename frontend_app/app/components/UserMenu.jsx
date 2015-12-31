var _ = require('underscore');
var $ = require('jquery');
var React = require('react');

var UserFeedTab = React.createClass({
    getInitialState: function(){
        return {

        };
    },
    handleButtonClick: function(e){
        var selected = ($(e.target).data('value'));
        this.props.handleMenuSelect(selected);
    },
    render: function(){
        var self = this;
        var props = {};
        _.each(['feeds', 'posts'], function(menuItem){
            props[menuItem] =
                {   outline: true,
                    onClick: self.handleButtonClick };
        });
        props[this.props.selected]['disabled'] = true;
        return <div>
            <button {...props['feeds']} data-value="feeds">Feeds</button>
            <button {...props['posts']} data-value="posts">Posts</button>
        </div>
    }
});
module.exports = UserFeedTab;