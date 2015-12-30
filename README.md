## ABOUT
`rss_monitor` is a small service for monitoring rss feeds.

## TO SETUP
Setup and start Rethink for your local system.
`npm install`

## TO RUN
Dev with Nodemon: NODE_ENV=development nodemon index.js
Dev without Nodemon: NODE_ENV=development node index.js
NODE_ENV=development RUN_TESTS=false gulp
Prod: NODE_ENV=production node index.js

## TODO
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

## NOTE
fix address already in use error: `killall -9 node; NODE_ENV=development RUN_TESTS=false gulp`