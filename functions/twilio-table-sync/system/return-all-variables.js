/*

  return-all-variables.js

  Retrun all environment varialbles

*/

// ADD twilio-service-helper
const tsh = require(Runtime.getFunctions()['twilio-table-sync/system/twilio-service-helper'].path);

// ADD Helper file to consistently format response header
const rsp = require(Runtime.getFunctions()['twilio-table-sync/system/format-response-headers'].path);

exports.handler = async function(context, event, callback) {
    
  // The Twilio node Client library 
  const client = context.getTwilioClient();

  // Pull the response object from helper library
  const response =  await rsp.formatResponseHeader()

  const environment = await tsh.getCurrentEnvironment(client, context.DOMAIN_NAME,);
  
  const variables = await tsh.getAllVariables(client, environment);

  response.appendHeader('Content-Type', 'application/json');
  let r = variables.sort((a, b) => (a.key > b.key) ? 1 : -1);
  response.setBody(r)
  
  return callback(null, response);
  

};