var $ = require('jquery');
var React = require('react');

var UserFeeds = React.createClass({
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
        var self = this;
        return <div>
            <table>
                <tbody>
                    {this.props.feeds.map(function(feed) {
                        return <tr key={feed.id}>
                            <td><h4>{feed.url}</h4></td>
                            <td>
                                <button
                                    type="black"
                                    data-feedid={feed.id}
                                    onClick={self.handleDeleteClick}>Delete</button>
                            </td>
                        </tr>
                    })}

                </tbody>
            </table>
        </div>
    }
});
module.exports = UserFeeds;