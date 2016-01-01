var React = require('react');
/**
    Properties:
        alertType: primary, error, warning, success
        message
*/
var Loading = React.createClass({
    handleCloseClick: function(e){
        this.props.actionHandler('closeNotice');
    },
    render: function(){
        if( !this.props.visible ){ return null; }
        var alertType = this.props.alertType ? this.props.alertType : 'error';
        var alertClass = 'alert alert-' + alertType;
        var message = this.props.message || '';
        return <div className={alertClass}>
            <div className="closeX">
                <a className="closeX" onClick={this.handleCloseClick}>X</a>
            </div>
            <div>{message}</div>
        </div>
    }
});

module.exports = Loading;