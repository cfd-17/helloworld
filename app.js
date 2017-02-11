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

// Connect to Infermedica
var client = new Client();


var args = {
    data: {
    "sex": "male",
    "age": 30,
    "evidence": [
      {"id": "s_1193", "choice_id": "present"},
      {"id": "s_488", "choice_id": "present"},
      {"id": "s_418", "choice_id": "present"}
    ]
  },
    headers: { "Content-Type": "application/json", "App-Id" : "b2a46cbc", "App-Key" : "523be4ddcc20678559583725c947b66c" }
};
 
client.post("https://api.infermedica.com/v2/diagnosis", args, function (data, response) {
    // parsed response body as js object 
    console.log(data);
});

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);