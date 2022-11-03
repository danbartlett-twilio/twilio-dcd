/*


*/

// ADD Helper file to consistently format response header
const rsp = require(Runtime.getFunctions()['system/format-response-headers'].path);

exports.handler = async function(context, event, callback) {
    
    // The Twilio node Client library 
    const client = context.getTwilioClient();

    // Pull the response object from helper library
    const response =  await rsp.formatResponseHeader()

    console.log("event.payload.webhook is => ", event.payload.webhook);

    client.conversations
        .conversations(event.payload.conversationSid)        
        .webhooks(event.payload.webhook)
        .remove()
        .then( result => {
            response.appendHeader('Content-Type', 'application/json');
            response.setBody({message:"removed webhook"}); 
            console.log("removed webhook...")            
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