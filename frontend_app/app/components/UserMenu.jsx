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
        if( selected === 'logout' ){
            return this.props.actionHandler('logout');
        }
        this.props.handleMenuSelect(selected);
    },
    render: function(){
        var self = this;
        var props = {};
        _.each(['feeds', 'posts', 'logout'], function(menuItem){
            props[menuItem] =
                {   outline: true,
                    onClick: self.handleButtonClick };
        });
        props[this.props.selected]['disabled'] = true;
        return <div>
            <button {...props['feeds']} data-value="feeds">Feeds</button>
            <button {...props['posts']} data-value="posts">Posts</button>
            <button {...props['logout']}
                    data-value="logout"
                    type="black"
                    className="button-logout">Logout</button>
        </div>
    }
});
module.exports = UserFeedTab;