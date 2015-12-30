var config = {};

config.env = window.location.href.indexOf('localhost:3000') !== -1 ? 
                                  'dev' : 'production';

if( config.env === 'dev' ){
    config.rootUrl = 'http://localhost:3000';
    config.debug = true;
} else {
    config.rootUrl = '';
    config.debug = false;
}

module.exports = config;