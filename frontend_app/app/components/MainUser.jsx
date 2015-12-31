var React = require('react');
var UserFeedTab = require('./UserFeedTab.jsx');
var UserMenu = require('./UserMenu.jsx');
var UserPosts = require('./UserPosts.jsx');

var MainUser = React.createClass({
    getInitialState: function(){
        return {
            visible: 'posts'
        }
    },
    handleMenuSelect: function(menuSelected){
        this.setState({visible: menuSelected});
    },
    render: function(){
        if( !this.props.visible ){ return null; }
        return <div>
            <UserMenu
                selected={this.state.visible}
                handleMenuSelect={this.handleMenuSelect} />
            <UserFeedTab
                visible={this.state.visible === 'feeds'}
                services={this.props.services} />
            <UserPosts
                visible={this.state.visible === 'posts'}
                services={this.props.services} />
        </div>
    }
});

module.exports = MainUser;