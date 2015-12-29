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
        resave: true,
        saveUninitialized: true,
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



    // TODO: Initialize model monitors



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

        var server = app.listen(config.port, function () {
            app.config.rootUrl = 'http://' + server.address().address +
                                  ':' + server.address().port;

            console.log("Example app listening at ", app.config.rootUrl);
                /***************************************************************

                                RUN TESTS

                ****************************************************************/
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