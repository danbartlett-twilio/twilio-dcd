/*


*/

// ADD Helper file to consistently format response header
const rsp = require(Runtime.getFunctions()['system/format-response-headers'].path);

exports.handler = async function(context, event, callback) {
    
    // The Twilio node Client library 
    const client = context.getTwilioClient();

    // Pull the response object from helper library
    const response =  await rsp.formatResponseHeader()

    console.log("event.payload.participant is => ", event.payload.participant);

    client.conversations
        .conversations(event.payload.conversationSid)
        .participants(event.payload.participant)
        .remove()
        .then( result => {
            response.appendHeader('Content-Type', 'application/json');
            response.setBody({message:"removed participant"}); 
            console.log("removed participant...")            
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