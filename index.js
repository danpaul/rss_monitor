var _ = require('underscore');
var config = require('./config')
var fs = require('fs');
var r = require('rethinkdb');
var schemaBuilder = require('./lib/rethink_schema_builder');
var tests = require('./test/index');

var USE_SESSIONS = false;

/*******************************************************************************

                    CONFIGURE APP AND SETUP MIDDLEWARE

*******************************************************************************/

var express = require('express');
var app = module.exports.app = exports.app = express();
app.models = {};
app.connection = null;

var bodyParser = require('body-parser')
var session = require('express-session')

app.use(express.static(__dirname + '/public'));

if( USE_SESSIONS ){
    app.use(require('cookie-parser')(config.cookieSecret)); 
    app.use(session({
        secret: config.sessionSecret,
        resave: true,
        saveUninitialized: true
    }));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/*******************************************************************************

                    CONNECT TO RETHINK AND START SERVER

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
        require('./routes/' + file)(app);
    })

    schemaBuilder.buildFromModels({connection: conn,
                                   models: app.models,
                                   db: config.rethink.db}, function(err){
        if( err ){
            throw err;
            return;
        }

        // run tests
        tests(app, function(err){
            if( err ){
                throw err;
                return;
            }
            console.log('TESTS PASSED!!!!');
            // start server
            var server = app.listen(config.port, function () {
                var host = server.address().address;
                var port = server.address().port;
                console.log("Example app listening at http://%s:%s", host, port);
            });
        });
    });
});