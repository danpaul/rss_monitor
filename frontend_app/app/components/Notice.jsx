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
        var alertClass = 'alert alert-' + (this.props.alertType || 'primary');
        var message = this.props.message || '';
        return <div className={alertClass}>
            <div>
                <a className="closeX" onClick={this.handleCloseClick}>X</a>
            </div>
            <div>{message}</div>
        </div>
    }
});

module.exports = Loading;