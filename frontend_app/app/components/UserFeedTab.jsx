var AddFeedForm = require('./AddFeedForm.jsx');
var React = require('react');
var UserFeeds = require('./UserFeeds.jsx');

var UserFeedTab = React.createClass({
    getInitialState: function(){
        return {
            feeds: []
        }
    },
    componentDidMount: function(){ this.updateFeeds(); },
    updateFeeds: function(e){
        var self = this;
        this.props.services.getUserFeeds(function(resp){
            if( resp.status !== 'success' ){
                return alert(resp.message);
            }
            self.setState({feeds: resp.feeds});
        });
    },
    render: function(){
        if( !this.props.visible ){ return null; }
        return <div>
            <AddFeedForm
                services={this.props.services}
                updateFeeds={this.updateFeeds} />
            <UserFeeds
                feeds={this.state.feeds}
                services={this.props.services}
                updateFeeds={this.updateFeeds} />
        </div>
    }
});
module.exports = UserFeedTab;