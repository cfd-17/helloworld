// Add your requirements
var restify = require('restify');
var builder = require('botbuilder');
var Client = require('node-rest-client').Client;

var APP_ID = "b2a46cbc"
var APP_KEY = "523be4ddcc20678559583725c947b66c"

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

// Initialise client
var client = new Client();

//=========================================================
// Bots Dialogs
//=========================================================

var bot = new builder.UniversalBot(connector);
bot.dialog('/', [
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/getUserDataName');
        }
        else if (!session.userData.sex) {
        	session.beginDialog('/getUserDataSex');
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
        console.log("get name");
    },
    function (session, results) {
        session.userData.name = results.response;
        console.log("store name");
        session.beginDialog('/');
    }
]);

bot.dialog('/getUserDataSex', [
    function (session) {
        builder.Prompts.text(session, 'What is your gender?');
        console.log("get sex");
    },
    function (session, results) {
        session.userData.sex = results.response;
        console.log("store sex");
        session.beginDialog('/');
    }
]);

bot.dialog('/getUserDataAge', [
    function (session) {
        builder.Prompts.text(session, 'What is your age?');
        console.log("get age");
    },
    function (session, results) {
        session.userData.age = results.response;
        console.log("store age");
        session.beginDialog('/');
    }
]);

bot.dialog('/getSymptoms', [
    function (session) {
        builder.Prompts.text(session, 'what symptoms do you have?');
        console.log("get symptoms");
    },
    function (session, results) {
        var args = {
    		data: { "text" : results.response },
    		headers: { "Content-Type": "application/json", "App-Id" : APP_ID, "App-Key" : APP_KEY }
		};
		client.post("https://api.infermedica.com/v2/parse", args, function (data, response) {
			console.log(data);
    		if(data.mentions.length < 1) {
    				session.send("Sorry I don't have knowledge about that");
    				session.beginDialog('/getSymptoms');
    		} else {
    			session.userData.evidence = []
    			for(var i=0; i<data.mentions.length; i++) {
	    			session.userData.evidence.push({ 
	    				"id": data.mentions[i].id,
	    				"choice_id" : data.mentions[i].choice_id
	    			});
    			}
    			console.log("going to further symptoms");
    			session.beginDialog('/getFurtherSymptoms');
    		}
		});
		console.log("symptoms over");
    }
]);

bot.dialog('/getFurtherSymptoms', [
    function (session) {
        builder.Prompts.text(session, 'Do you have any more symptoms?');
    },
    function (session, results) {
    	if(results.response == 'no' || results.response == 'No') {
    		console.log("no in further symptoms");
    		var args = {
    			data: { "sex": session.userData.sex,
    					"age": session.userData.age,
    					"evidence": session.userData.evidence
    			},
    			headers: { "Content-Type": "application/json", "App-Id" : APP_ID, "App-Key" : APP_KEY }
			};
			console.log(args);
    		client.post("https://api.infermedica.com/v2/diagnosis", args, function (data, response) {
				console.log(data);
			});
    	} else {
	        var args = {
	    		data: { "text" : results.response },
	    		headers: { "Content-Type": "application/json", "App-Id" : APP_ID, "App-Key" : APP_KEY }
			};
			client.post("https://api.infermedica.com/v2/parse", args, function (data, response) {
				console.log(data);
	    		if(data.mentions.length < 1) {
	    				session.send("Sorry I don't have knowledge about that");
	    		} else {
	    				for(var i=0; i<data.mentions.length; i++) {
			    			session.userData.evidence.push({ 
			    				"id": data.mentions[i].id,
			    				"choice_id" : data.mentions[i].choice_id
			    			});
    					}
	    		}
	    		session.beginDialog('/getFurtherSymptoms');
			});
		}
    }
]);