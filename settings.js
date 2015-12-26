var config = require('./config');

// base settings
var settings = {
    feedMonitorInterval: 60000
};

// env settings
if( config.environment === 'development' ){
    settings.feedMonitorInterval = 10000;
} else if( config.environment === 'production' ) {

}

module.exports = settings;