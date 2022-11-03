/*

  document-all.js

  Return all sync documents

*/

// ADD Helper file to consistently format response header
const rsp = require(Runtime.getFunctions()['twilio-table-sync/system/format-response-headers'].path);

exports.handler = async function(context, event, callback) {
  
  const client = context.getTwilioClient();
    
  // Pull the response object from helper library
  const response =  await rsp.formatResponseHeader()


  client.sync.services(context.TWILIO_SYNC_SERVICE_SID)
      .documents
      .list({limit: 100})
      .then(result => {
        console.log(result);
        response.appendHeader('Content-Type', 'application/json');
        let r = result.sort((a, b) => (a.uniqueName > b.uniqueName) ? 1 : -1);
        response.setBody(r)
        callback(null, response)
    })
    .catch(err => {
      console.log(err.status);      
      response.appendHeader('Content-Type', 'plain/text');
      response.setBody(err);
      response.setStatusCode(500);
      return callback(null, response);
    });
      
  }