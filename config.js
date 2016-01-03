var config = {};

config.environment = process.env.NODE_ENV ?
                        process.env.NODE_ENV : 'development';

if( config.environment === 'development' ){

    config.sessionSecret = 'super secret';
    config.cookieSecret = 'super secret';
    config.port = 3000;
    config.rethink = {
        db: 'rss_monitor',
        host: '127.0.0.1',
        port: '28015'
    }
} else if( config.environment === 'production' ) {
    config.sessionSecret = process.env.SESSION_SECRET;
    config.cookieSecret = process.env.COOKIE_SECRET;
    config.port = 8000;
    config.rethink = {
        db: 'rss_monitor',
        host: '127.0.0.1',
        port: '28015'
    }
} else {
    throw('App must be started with env flag set.');
}

module.exports = config;