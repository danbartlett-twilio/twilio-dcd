/*

  return-all-variables.js

  Retrun all system varialbles

*/

// ADD Helper file to consistently format response header
const rsp = require(Runtime.getFunctions()['system/format-response-headers'].path);

exports.handler = async function(context, event, callback) {
    
    // The Twilio node Client library 
    const client = context.getTwilioClient();

    // Pull the response object from helper library
    const response =  await rsp.formatResponseHeader()

    client.conversations
        .services(context.CHAT_SID)
        .conversations.list()
        .then(
            (conversations) => {
                console.log("Number of conversations returned => ", conversations.length);  
                response.appendHeader('Content-Type', 'application/json');
                response.setBody(conversations.sort((a, b) => b.dateCreated - a.dateCreated));                                 
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