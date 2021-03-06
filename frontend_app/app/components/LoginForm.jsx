var FormMixin = require('./mixins/FormMixin.jsx');
var React = require('react');

var LoginForm = React.createClass({
    mixins: [FormMixin],
    getInitialState: function(){
        return {
            email: '',
            password: ''
        };
    },
    handleLoginClick: function(e){
        e.preventDefault();
        this.props.actionHandler('login', this.state);
    },
    handleCancelClick: function(e){
        e.preventDefault();
    },
    handleRegisterClick: function(e){
        this.props.actionHandler('showRegisterForm');
    },
    render: function(){
        if( !this.props.visible ){ return null; }
        return <div className="form-wrapper">
            <form className="forms">
                <section>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        className="width-12"
                        value={this.state.email}
                        onChange={this.handleInputChange} />
                </section>
                <section>
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        className="width-12"
                        value={this.state.password}
                        onChange={this.handleInputChange} />
                </section>
                <section>
                    <button
                        type="primary"
                        onClick={this.handleLoginClick}
                        >Login</button>
                    <button
                        onClick={this.handleCancelClick}
                        className="hidden">Cancel</button>
                </section>
            </form>
            <a onClick={this.handleRegisterClick}>Register</a>
        </div>
    }
});

module.exports = LoginForm;