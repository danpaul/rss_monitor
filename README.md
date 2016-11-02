## ABOUT
`rss_monitor` is an appliction for tracking, viewing and ranking rss feeds

## TO SETUP
Setup and start Rethink for your local system.
`npm install`

## TO RUN
Dev with Nodemon: NODE_ENV=development nodemon index.js

Dev without Nodemon: NODE_ENV=development node index.js

Front end dev: NODE_ENV=development RUN_TESTS=false gulp

Prod: NODE_ENV=production SESSION_SECRET=... COOKIE_SECRET=... node index.js

## TODO
* Rework user auth to use sql_user_manager
  * keep existing user object in rethink DB but remove auth fields and generate ID
  * add hooks to sql_user_manager for registration, login, logout
  * update auth.getUserId to parse numeric id for rethink ID 'user-' + id
* Add user/auth check to all routes
* Add material ui framework to front end
* Revise front end: https://monosnap.com/file/3Q4I9rRQn9LzwlhAK2ecqUpqeUL2Cf
  * fix date parsing
* Add settings page
  * hide already viewed
* Add save functionality and saved view
* QA

## Back Burner TODO
* Review query in models.post.getFromFeeds
* Turn on feed monitors on startup
* add cron to clear old user logs
* check use of base.prototype.filter (may be non-indexed)
* confirm feed exists in user.addFeed
* confirm orderby index is in place for models.post.getFromFeeds query: http://stackoverflow.com/questions/28583653/how-to-
use-getall-with-orderby-in-rethinkdb

## Features
* Add commentary
* Tags, socially curated tags
* User groupings/suggestion engine
* Determine feed ranking based on percentage of up/downvotes for feed (for users who are actually following that feed)

## NOTE
fix address already in use error: `killall -9 node; NODE_ENV=development RUN_TESTS=false gulp`