/*

  list-item-update.js

  Update a specific item in list given list SID, item index, and item payload

*/

// ADD Helper file to consistently format response header
const rsp = require(Runtime.getFunctions()['twilio-table-sync/system/format-response-headers'].path);

exports.handler = async function(context, event, callback) {

  const client = context.getTwilioClient();

  // Pull the response object from helper library
  const response =  await rsp.formatResponseHeader()  

  console.log('event => ', event);
  console.log('event.payload => ', event.payload);
  
  client.sync.services(context.TWILIO_SYNC_SERVICE_SID)
    .syncLists(event.targetList)            
    .syncListItems(parseInt(event.listItemIndex))
    .update({data: event.payload})
    .then(() => {
      response.appendHeader('Content-Type', 'application/json');
      response.setBody(event);              
      callback(null,response);
    })
    .catch(err => {
      console.log(err.status);      
      response.appendHeader('Content-Type', 'plain/text');
      response.setBody(err);
      response.setStatusCode(500);
      return callback(null, response);
    });            

};