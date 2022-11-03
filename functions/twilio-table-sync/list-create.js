/*

  list-create.js

  Create a new sync list

*/

// ADD Helper file to consistently format response header
const rsp = require(Runtime.getFunctions()['twilio-table-sync/system/format-response-headers'].path);

exports.handler = async function(context, event, callback) {
    
  const client = context.getTwilioClient();
  
  // Pull the response object from helper library
  const response =  await rsp.formatResponseHeader()

  client.sync.services(context.TWILIO_SYNC_SERVICE_SID)
    .syncLists
    .create({uniqueName: event.uniqueName})
    .then(sync_list => {
      response.appendHeader('Content-Type', 'application/json');
      response.setBody(sync_list);              
      callback(null,response)
    })
    .catch(err => {
      console.log(err.status);      
      response.appendHeader('Content-Type', 'plain/text');
      response.setBody(err);
      response.setStatusCode(500);
      return callback(null, response);
    });      

};