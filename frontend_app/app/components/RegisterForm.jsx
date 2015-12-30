var FormMixin = require('./mixins/FormMixin.jsx');

var LoginForm = React.createClass({
    mixins: [FormMixin],
    getInitialState: function(){
        return {
            email: '',
            password: ''
        };
    },
    handleRegisterClick: function(e){
        e.preventDefault();
        this.props.actionHandler('register', this.state);
    },
    handleCancelClick: function(e){
        e.preventDefault();
    },
    handleLoginClick: function(e){
        this.props.actionHandler('showLoginForm');
    },
    render: function(){
        if( !this.props.visible ){ return null; }
        return <div>
            <form className="forms">
                <section>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        className="width-6"
                        value={this.state.email}
                        onChange={this.handleInputChange} />
                </section>
                <section>
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={this.state.password}
                        onChange={this.handleInputChange} />
                </section>
                <section>
                    <button type="primary" onClick={this.handleRegisterClick}>Register</button>
                    <button onClick={this.handleCancelClick}>Cancel</button>
                </section>
            </form>
            <a onClick={this.handleLoginClick}>Login</a>
        </div>
    }
});

module.exports = LoginForm;