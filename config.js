var config = {};

config.environment = process.env.NODE_ENV ?
                        process.env.NODE_ENV : 'development';

if( config.environment === 'development' ){

    config.sessionSecret = 'super secret';
    config.cookieSecrety = 'super secret';
    config.port = 3000;
    config.rethink = {
        db: 'rss_monitor',
        host: '127.0.0.1',
        port: '28015'
    }
} else if( config.environment === 'production' ) {



} else {
    throw('App must be started with env flag set.')
}

module.exports = config;