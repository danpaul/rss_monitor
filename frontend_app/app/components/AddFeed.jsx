var Notice = require('./Notice.jsx');
var FormMixin = require('./mixins/FormMixin.jsx');

var AddFeed = React.createClass({
    mixins: [FormMixin],
    getInitialState: function(){
        return {
            feeds: [],
            url: ''
        }
    },
    componentDidMount: function(){ this.updateFeeds(); },
    handleAddClick: function(e){
        e.preventDefault();
        var self = this;
        self.props.services.addFeed({url: self.state.url}, function(resp){
            if( resp.status !== 'success' ){
                return alert(resp.message);
            }
            self.updateFeeds();
        });
    },
    updateFeeds: function(e){
        this.props.services.getUserFeeds(function(resp){
            if( resp.status !== 'success' ){
                return alert(resp.message);
            }

        });
    },
    render: function(){
        if( !this.props.visible ){ return null; }
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
module.exports = AddFeed;