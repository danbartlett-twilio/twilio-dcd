/*

  document-get-by-unique-name.js

  Return sync document with uniqueName that matched input

*/

// ADD Helper file to consistently format response header
const rsp = require(Runtime.getFunctions()['twilio-table-sync/system/format-response-headers'].path);

exports.handler = async function(context, event, callback) {
  
  const client = context.getTwilioClient();

  // Pull the response object from helper library
  const response =  await rsp.formatResponseHeader()

  client.sync.services(context.TWILIO_SYNC_SERVICE_SID)
      .documents      
      .list()
      .then(syncDocs => {        
        response.appendHeader('Content-Type', 'application/json');        
        syncDocs.forEach(syncDoc => {
          console.log("syncDoc => ", syncDoc);
          console.log("syncDoc.uniqueName => ", syncDoc.uniqueName);
          console.log("uniqueName => ", event.uniqueName);
          if (syncDoc.uniqueName === event.uniqueName) {
            response.setBody(syncDoc);        
            callback(null, response)
          }
        });
    })
    .catch(err => {
      console.log(err.status);      
      response.appendHeader('Content-Type', 'plain/text');
      response.setBody(err);
      response.setStatusCode(500);
      return callback(null, response);
    });
}

