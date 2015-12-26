var request = require('request');
var FeedParser = require('feedparser');

var USER_AGENT_HEADER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36';

/**
    Required:
        options.url
    callback:(err, {meta, data})
*/
module.exports = function(options, callback){

    var req = request(options.url, {timeout: 10000, pool: false});
    req.setMaxListeners(50);

    // Some feeds do not respond without user-agent and accept headers.
    req.setHeader('user-agent', USER_AGENT_HEADER);
    req.setHeader('accept', 'text/html,application/xhtml+xml');

    var feedparser = new FeedParser();

    // Define our handlers
    req.on('error', callback);
    req.on('response', function(res) {
        if (res.statusCode != 200){
            callback(new Error('Bad status code'));
            return;
        }
        res.pipe(feedparser);
    });

    feedparser.on('error', callback);
    feedparser.on('readable', function() {
        var meta = this.meta;
        var post;
        while( post = this.read() ){
            callback(null, {meta: meta, data: post});
        };
    });

}