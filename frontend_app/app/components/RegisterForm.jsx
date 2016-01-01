var FormMixin = require('./mixins/FormMixin.jsx');
var React = require('react');

var LoginForm = React.createClass({
    mixins: [FormMixin],
    getInitialState: function(){
        return {
            email: '',
            password: '',
            confirm_password: '',
            passwordsMatch: 'true'
        };
    },
    handleRegisterClick: function(e){
        e.preventDefault();
        this.props.actionHandler('register',
                                 {email: this.state.email,
                                  password: this.state.password});
        this.setState({email: '', password: '', confirm_password: ''});
    },
    handleCancelClick: function(e){
        e.preventDefault();
    },
    handleConfirmPasswordChange: function(e){
        var self = this;
        this.handleInputChange(e, function(){
            var passwordsMatch =
                (self.state.password === self.state.confirm_password);
            self.setState({passwordsMatch: passwordsMatch})
        });
    },
    handleLoginClick: function(e){
        this.props.actionHandler('showLoginForm');
    },
    render: function(){
        if( !this.props.visible ){ return null; }
        var passwordMatchError = <span className="error">Passwords do not match</span>;
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
                    <label>
                        Confirm Password {this.state.passwordsMatch ? '' : passwordMatchError}
                    </label>
                    <input
                        type="password"
                        name="confirm_password"
                        className={this.state.passwordsMatch ? 'width-12' : 'width-12 input-error'}
                        value={this.state.confirm_password}
                        onChange={this.handleConfirmPasswordChange} />
                </section>
                <section>
                    <button
                        type="primary"
                        onClick={this.handleRegisterClick} >
                        Register
                    </button>
                    <button
                        onClick={this.handleCancelClick}
                        className="hidden"
                    >Cancel</button>
                </section>
            </form>
            <a onClick={this.handleLoginClick}>Login</a>
        </div>
    }
});

module.exports = LoginForm;