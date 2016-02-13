var config = require('./config');

// base settings
var settings = {
    feedMonitorInterval: 60000
};

// env settings
if( config.environment === 'development' ){
    // settings.feedMonitorInterval = 5000;
    settings.feedMonitorInterval = 1000 * 60 * 10;
} else if( config.environment === 'production' ){

}

module.exports = settings;