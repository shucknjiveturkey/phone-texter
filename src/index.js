'use strict';

//assigns App ID
var APP_ID = undefined; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

//includes Alexa knowledge
var AlexaSkill = require('./AlexaSkill');

//the head cheese
var PhoneTexter = function () {
    AlexaSkill.call(this, APP_ID);
};



PhoneTexter.prototype = Object.create(AlexaSkill.prototype);
PhoneTexter.prototype.constructor = PhoneTexter;

//start session
PhoneTexter.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

//do stuff
PhoneTexter.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    handleWelcomeRequest(response);
};

//end session
PhoneTexter.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    //console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
    //    + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

//handlers
PhoneTexter.prototype.intentHandlers = {
    "PhoneTexterIntent": function (intent, session, response) {
        handlePhoneTexterRequest(intent, session, response);
    },
	"AMAZON.HelpIntent": function (intent, session, response) {
        handleHelpRequest(response);
    }
};


//people that you can text and their numbers
var PEOPLE = {
	"mitch" : 5154734948,
	"jessica" : 5551021213	
};


//welcome request handled onLaunch
function handleWelcomeRequest(response) {
    var whichNamePrompt = "Who would you like to text? ",
        speechOutput = {
            speech: "<speak>Welcome to Phone Texter. "
			+ whichNamePrompt 
			+ "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        },
        repromptOutput = {
            speech: "<speak>I did not hear you. "
			+ whichNamePrompt 
			+ "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };

    response.ask(speechOutput, repromptOutput);
}

//gathers name from intent and turns into variable to be used in this code
function handlePhoneTexterRequest(intent, session, response) {

    var nameToText = getNameFromIntent(intent, true),
        repromptText,
        speechOutput;
		if (nameToText.error) {
			repromptText = "I know the numbers for " + getAllPeopleText()
				+ " Who would you like to text?";
			// if we received a value for the incorrect city, repeat it to the user, otherwise we received an empty slot
			speechOutput = nameToText.name ? "I'm sorry, I don't have any data for " + nameToText.name + ". " + repromptText : repromptText;
			response.ask(speechOutput, repromptText);
			return;
		}
	getFinalNameResponse(nameToText, response);

}


//help info
function handleHelpRequest(response) {
    var repromptText = "Who would you like to text? ";
    var speechOutput = "I can help you text someone. "
		+ repromptText;

    response.ask(speechOutput, repromptText);
}


//give the name, and get the vaule
function getNameFromIntent(intent,assignDefault) {

     var nameSlot = intent.slots.Name;
    
    if (!nameSlot || !nameSlot.value) {
        if (!assignDefault) {
            return {
                error: true
            };
        } else {
            // For sample skill, default to mitch
            return {
                name: 'mitch',
                people: PEOPLE.mitch
            };
        }
    } else {
        // looksup the names and maps to the name if the value/name is available
        var textName = nameSlot.value;
        if (PEOPLE[textName.toLowerCase()]) {
            return {
                name: textName,
                people: PEOPLE[textName.toLowerCase()]
            };
        } else {
            return {
                error: true,
                people: textName
            };
        }
    }
}


//give alexa feedback
function getFinalNameResponse(nameToText, response) {
	response.tellWithCard("Phone Texter", nameToText.name);
}

//the people who have numbers hardcoded
function getAllPeopleText() {
    var peopleList = '';
    for (var people in PEOPLE) {
        peopleList += people + ", ";
    }
	return peopleList;
}

//formulate and execute the code
exports.handler = function (event, context) {
    var phoneTexter = new PhoneTexter();
    phoneTexter.execute(event, context);
};