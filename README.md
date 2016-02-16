## ABOUT
`rss_monitor` is a small service for monitoring rss feeds.

## TO SETUP
Setup and start Rethink for your local system.
`npm install`

## TO RUN
Dev with Nodemon: NODE_ENV=development nodemon index.js

Dev without Nodemon: NODE_ENV=development node index.js

Front end dev: NODE_ENV=development RUN_TESTS=false gulp

Prod: NODE_ENV=production SESSION_SECRET=... COOKIE_SECRET=... node index.js


## TODO
* front end style revision (p)
    http://neat.bourbon.io/
* add find feed for site
* add feed info
* toggle to allow view/don't view alread read
* add saved posts
* configure save to pocket
* infinite scroll w/refresh button
W * switch out front end framework
W * add tags to front end
* validate GUID
* Add date and source to posts
* Add channel info and image image and post image
* Review query in models.post.getFromFeeds
* Turn on feed monitors on startup
* Delete test monitors/feeds
* Delete test users
* add cron to clear old user logs
* check use of base.prototype.filter (may be non-indexed)
* handle invalid feeds
* implement feed._feedIsValid
* confirm feed exists in user.addFeed
* replace all UI alerts with styled UI component
* validate post fields before they get added to DB
* improve efficiency of models.userPostLog.addMultiple
* potentially replace current rss parser with feed-read (callback based and simpler)
* confirm orderby index is in place for models.post.getFromFeeds query: http://stackoverflow.com/questions/28583653/how-to-
use-getall-with-orderby-in-rethinkdb
    + also check index in: models.savedPost.getUserPosts

## NOTE
fix address already in use error: `killall -9 node; NODE_ENV=development RUN_TESTS=false gulp`