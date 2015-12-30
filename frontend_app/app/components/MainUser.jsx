var AddFeed = require('./AddFeed.jsx');

var MainUser = React.createClass({
    getInitialState: function(){
        return {
            // visible: 'posts'
            visible: 'addFeed'
        }
    },
    render: function(){
        if( !this.props.visible ){ return null; }
        return <div>
            <AddFeed
                visible={this.state.visible === 'addFeed'}
                services={this.props.services} />
        </div>
    }
});

module.exports = MainUser;