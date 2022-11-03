/*

  format-response-headers.private.js

  Sets response headers -- enable / disable CORS
  => CORS needed for local development of SPAs

*/

exports.formatResponseHeader = async () => {

    // Create a custom Twilio Response
    const response = new Twilio.Response();
    
    // Set the CORS headers to allow calls from localhost domains
    // Disabling CORS allows access ONLY from same domain
    // To diable, comment out the 3 lines below:
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type'); 
 
     return response;
 }