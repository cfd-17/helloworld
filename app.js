// Add your requirements
var restify = require('restify');
var builder = require('botbuilder');
var Client = require('node-rest-client').Client;

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: 'fcd9f593-42e9-4e25-a8e0-39da623b7b05',
    appPassword: '1UDd4e7ktNsketpCRtT11Ud'
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

var bot = new builder.UniversalBot(connector);
bot.dialog('/', [
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/getUserDataName');
        }
        else if (!session.userData.age) {
        	session.beginDialog('/getUserDataAge');
        }
        else if (!session.userData.symptoms) {
            session.beginDialog('/getSymptoms');
        }
        else {
        	next();
        }
    },
    function (session, results) {
        session.send('Hello %s, %s, %s', session.userData.name, session.userData.age, session.userData.symptoms);
    }
]);

bot.dialog('/getUserDataName', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.beginDialog('/');
    }
]);

bot.dialog('/getUserDataAge', [
    function (session) {
        builder.Prompts.text(session, 'What is your age?');
    },
    function (session, results) {
        session.userData.age = results.response;
        session.beginDialog('/');
    }
]);

bot.dialog('/getSymptoms', [
    function (session) {
        builder.Prompts.text(session, 'Enter your symptoms');
    },
    function (session, results) {
        session.userData.symptoms = results.response;
        session.beginDialog('/');
    }
]);
