/*


*/

// ADD Helper file to consistently format response header
const rsp = require(Runtime.getFunctions()['system/format-response-headers'].path);

exports.handler = async function(context, event, callback) {
    
    // The Twilio node Client library 
    const client = context.getTwilioClient();

    // Pull the response object from helper library
    const response =  await rsp.formatResponseHeader()

    console.log("event.payload.conversationSid is => ", event.payload.conversationSid);

    client.conversations
        .conversations(event.payload.conversationSid)
        .remove()
        .then(() => {
            response.appendHeader('Content-Type', 'application/json');
            response.setBody({sid:event.payload.conversationSid}); 
            console.log(event.payload.conversationSid)            
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