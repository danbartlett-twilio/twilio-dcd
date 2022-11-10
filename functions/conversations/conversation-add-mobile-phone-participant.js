/*

*/

// ADD Helper file to consistently format response header
const rsp = require(Runtime.getFunctions()['system/format-response-headers'].path);

exports.handler = async function(context, event, callback) {
    
    // The Twilio node Client library 
    const client = context.getTwilioClient();

    // Pull the response object from helper library
    const response =  await rsp.formatResponseHeader()

    console.log("event is => ", event);

    client.conversations
        .conversations(event.payload.conversationSid)
        .participants
        .create({
            'messagingBinding.address': event.payload.mobile_number,
            'messagingBinding.proxyAddress': context.TWILIO_PHONE_NUMBER,
            'attributes': JSON.stringify(event.payload.attributes)            
        })
        .then(participant => {
            response.appendHeader('Content-Type', 'application/json');
            response.setBody({participant:participant.sid});             
            console.log(participant.sid)            
            callback(null, response);               
        })
        .catch(err => {
            console.log(err.status);      
            response.appendHeader('Content-Type', 'application/json');
            response.setBody(err);
            response.setStatusCode(err.status);
            return callback(null, response);
          });
};