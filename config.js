var config = {};

config.environment = process.env.NODE_ENV ?
                        process.env.NODE_ENV : 'development';

if( config.environment === 'development' ){

    config.sessionSecret = 'super secret';
    config.cookieSecret = 'super secret';
    config.port = 3010;
    config.rootUrl = 'http://localhost:' + config.port;
    
    config.rethink = {
        db: 'rss_monitor',
        host: '127.0.0.1',
        port: '28015'
    }
    config.debug = true;
} else if( config.environment === 'production' ) {
    config.sessionSecret = process.env.SESSION_SECRET;
    config.cookieSecret = process.env.COOKIE_SECRET;
    config.port = 8000;
    config.rootUrl = 'http://159.203.131.38:' + config.port;
    config.rethink = {
        db: 'rss_monitor',
        host: '127.0.0.1',
        port: '28015'
    }
    config.debug = false;
} else {
    throw('App must be started with env flag set.');
}

module.exports = config;