var _ = require('underscore');
var config = require('./config')
var fs = require('fs');
var r = require('rethinkdb');
var schemaBuilder = require('./lib/rethink_schema_builder');
var tests = require('./test/index');

var USE_SESSIONS = true;

/*******************************************************************************

                    CONFIGURE APP AND SETUP MIDDLEWARE

*******************************************************************************/

var express = require('express');
var app = module.exports.app = exports.app = express();
app.models = {};
app.config = config;
app.connection = null;
app.settings = require('./settings');

var bodyParser = require('body-parser')

app.use(express.static(__dirname + '/public'));

if( USE_SESSIONS ){
    var session = require('express-session')
    app.use(require('cookie-parser')(config.cookieSecret));
    var RDBStore = require('express-session-rethinkdb')(session);
    var rDBStore = new RDBStore({ connectOptions: config.rethink });
    app.use(session({
        secret: config.sessionSecret,
        // resave: true,
        resave: false,
        //  saveUninitialized: true,
        saveUninitialized: false,
        store: rDBStore
    }));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/*******************************************************************************

                    CONNECT TO RETHINK

*******************************************************************************/
r.connect(config.rethink, function(err, conn) {
    if( err ){
        throw(err);
        return;
    }
    app.connection = conn;
    /***************************************************************************

                        PULL IN ROUTES AND MODELS

    ***************************************************************************/
    _.each(fs.readdirSync('./models'), function(file){
        var model = require('./models/' + file)(app);
        app.models[model.name] = model;
    })

    _.each(fs.readdirSync('./routes'), function(file){
        var routePath = '/' + file.replace(/\.[^/.]+$/, "") + '/';
        app.use(routePath, require('./routes/' + file)(app));
    })
    /***************************************************************************

                        BUILD SCHEMA

    ***************************************************************************/
    schemaBuilder.buildFromModels({connection: conn,
                                   models: app.models,
                                   db: config.rethink.db}, function(err){
        if( err ){
            throw err;
            return;
        }

        /***********************************************************************

                    START SERVER

        ***********************************************************************/

        // activate feeds
        app.models.feed.turnOnFeeds(function(err){ if( err ){ throw(err); } })

        var server = app.listen(config.port, function () {

            console.log("RSS Monitor listening at ", app.config.rootUrl);
            /*******************************************************************

                            RUN TESTS

            *******************************************************************/
            if( typeof(process.env.RUN_TESTS) !== 'undefined' &&
                process.env.RUN_TESTS === 'false' ){ return; }
            tests(app, function(err){
                if( err ){
                    throw err;
                    return;
                }
                console.log('TESTS PASSED!!!');
            });
        });
    });
});