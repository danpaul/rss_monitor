var LoginForm = require('./components/LoginForm.jsx');
var Loading = require('./components/Loading.jsx');
var MainUser = require('./components/MainUser.jsx');
var Notice = require('./components/Notice.jsx');
var RegisterForm = require('./components/RegisterForm.jsx');
var React = require('react');
var ReactDOM = require('react-dom');
var services = require('./services');

var Controller = React.createClass({

    user: null,

    getInitialState: function(){
        return {
            // loading, login, notice
            visible: 'loading',
            showNotice: false,
            noticeMessage: ''
        };
    },

    actionHandler: function(action, options){
        var self = this;
        var actions = {
            closeNotice: function(options){
                self.setState({ showNotice: false, noticeMessage: ''});
            },
            init: function(options){
                services.getUser(function(resp){
                    if( resp.status === 'success' ){
                        self.user = resp.user;
                        self.setState({visible: 'mainUser'});
                    } else if( resp.status === 'failure' ){
                        self.setState({visible: 'login'});
                    } else if( resp.status === 'error' ) {
                        self.setState({ showNotice: 'true',
                                        noticeMessage: resp.message });
                    }
                });
            },
            login: function(options){
                services.login(options, function(resp){
                    if( resp.status === 'success' ){
                        // load user posts
                    } else {
                        self.setState({ showNotice: 'true',
                                        noticeMessage: resp.message });
                    }
                });
            },
            register: function(options){
                services.register(options, function(resp){
                    if( resp.status === 'success' ){
                        self.setState({ showNotice: 'true',
                                        noticeMessage: 'Success!!! Please login',
                                        visible: 'login' });
                    } else {
                        self.setState({ showNotice: 'true',
                                        noticeMessage: resp.message });
                    }
                });
            },
            showLoginForm: function(options){
                self.setState({visible: 'login'});
            },
            showRegisterForm: function(options){
                self.setState({visible: 'register'});
            },
        }
        if( !actions[action] ){ return console.log('No action: ', action); }
        var f = actions[action];
        f(options);
    },

    componentDidMount: function(){
        this.actionHandler('init')
    },

    render: function(){
        var self = this;
        return <div>
            <Notice
                visible={this.state.showNotice}
                message={this.state.noticeMessage}
                actionHandler={this.actionHandler} />
            <Loading
                visible={this.state.visible === 'loading'} />
            <LoginForm
                visible={this.state.visible === 'login'}
                actionHandler={this.actionHandler} />
            <RegisterForm
                visible={this.state.visible === 'register'}
                actionHandler={this.actionHandler} />
            <MainUser
                visible={this.state.visible === 'mainUser'}
                actionHandler={this.actionHandler}
                services={services} />
        </div>;

    }
});

ReactDOM.render(
    <Controller />,
    document.getElementById('content')
);