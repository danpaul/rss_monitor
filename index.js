var _ = require('underscore');
var config = require('./config')
var fs = require('fs');
var r = require('rethinkdb');
var schemaBuilder = require('./lib/rethink_schema_builder');
var tests = require('./test/index');

var RUN_TESTS = false;

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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = nodemailer.createTransport(smtpTransport(config.smtp));

var options = {
    rootUrl: config.rootUrl + '/auth', // should match the middleware root
    rethinkConnectionOptions: config.rethink,
    databaseName: config.rethink.db,
    tableName: 'rss_monitor_auth',
    transporter: transporter,
    siteName: 'RSS Monitor',
    sessionSecret: config.sessionSecret,
    loginSuccessRedirect: config.rootUrl
}
var userManager = require('node_express_user_manager')(app, options);
app.use('/auth', userManager);

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

        // init models
        _.each(app.models, function(model){ if( model.init ){ model.init();} });

        var server = app.listen(config.port, function () {

            console.log("RSS Monitor listening at ", app.config.rootUrl);
            /*******************************************************************

                            RUN TESTS

            *******************************************************************/
            if( typeof(process.env.RUN_TESTS) !== 'undefined' &&
                process.env.RUN_TESTS === 'false' ){ return; }
            if( !RUN_TESTS ){ return; }
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