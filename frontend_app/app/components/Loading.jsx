var Loading = React.createClass({
    getInitialState: function(){
        return {
            dots: '.'
        }
    },
    componentDidMount: function(){
        var self = this;
        setInterval(function(){
            var dots = self.state.dots + '.';
            if( dots.length === 4 ){ dots = '.'; }
            self.setState({dots: dots});
        }, 333.33);
    },
    render: function(){
        if( !this.props.visible ){ return null; }
        return <h1>Loading{this.state.dots}</h1>
    }
});

module.exports = Loading;