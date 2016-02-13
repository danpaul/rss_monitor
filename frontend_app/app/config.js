var config = {};

config.env = window.location.href.indexOf('localhost:3010') !== -1 ? 
                                          'dev' : 'production';

if( config.env === 'dev' ){
    config.rootUrl = 'http://localhost:3010';
    config.debug = true;
} else {
    config.rootUrl = '';
    config.rootUrl = 'http://159.203.131.38:8000';
    config.debug = false;
}

module.exports = config;