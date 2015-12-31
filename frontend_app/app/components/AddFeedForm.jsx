var FormMixin = require('./mixins/FormMixin.jsx');
var Notice = require('./Notice.jsx');
var React = require('react');

var UserFeeds = React.createClass({
    mixins: [FormMixin],
    getInitialState: function(){
        return {
            url: ''
        }
    },
    handleAddClick: function(e){
        e.preventDefault();
        var self = this;
        self.props.services.addFeed({url: self.state.url}, function(resp){
            if( resp.status !== 'success' ){
                return alert(resp.message);
            }
            // todo: add success message
            self.setState({url: ''}, self.props.updateFeeds);
        });
    },
    render: function(){
        return <div>
            <form className="forms">
                <section>
                    <label>Feed URL</label>
                    <input
                        type="text"
                        name="url"
                        className="width-6"
                        value={this.state.url}
                        onChange={this.handleInputChange} />
                </section>
                <section>
                    <button type="primary" onClick={this.handleAddClick}>
                        Add
                    </button>
                </section>
            </form>
        </div>
    }
});
module.exports = UserFeeds;