/*


*/

// ADD Helper file to consistently format response header
const rsp = require(Runtime.getFunctions()['system/format-response-headers'].path);

exports.handler = async function(context, event, callback) {
    
    // The Twilio node Client library 
    const client = context.getTwilioClient();

    // Pull the response object from helper library
    const response =  await rsp.formatResponseHeader()

    console.log("event.sid is => ", event.sid);

    client.conversations
        .services(context.CHAT_SID)
        .conversations(event.sid)
        .messages
        .list()
        .then(
            (messages) => {
                response.appendHeader('Content-Type', 'application/json');
                response.setBody(messages);                 
                console.log("Number of messages returned => ", messages.length);
                callback(null, response);     
            } 
        )
        .catch(err => {
            console.log(err.status);      
            response.appendHeader('Content-Type', 'application/json');
            response.setBody(err);
            response.setStatusCode(err.status);
            return callback(null, response);
          });       

};