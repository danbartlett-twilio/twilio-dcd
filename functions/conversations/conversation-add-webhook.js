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
        .webhooks
        .create(event.payload.createObject)
        /** Object Examples for payload.createObject
            
            Studio Flow:
                "configuration.flowSid": "replace this with your Studio Flow Sid",
                "configuration.replayAfter": 0,
                target: "studio"            
            
            Other:
                'configuration.method': 'GET',
                'configuration.filters': ['onMessageAdded', 'onConversationRemoved'],
                'configuration.url': 'https://example.com',
                target: 'webhook'

         */         
        .then(webhook => {
            response.appendHeader('Content-Type', 'application/json');
            response.setBody({webhook:webhook.sid});             
            console.log(webhook.sid)            
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