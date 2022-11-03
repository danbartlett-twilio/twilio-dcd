/*


*/

const axios = require('axios');
// ADD Helper file to consistently format response header
const rsp = require(Runtime.getFunctions()['system/format-response-headers'].path);

exports.handler = async function(context, event, callback) {
   
    // Pull the response object from helper library
    const response =  await rsp.formatResponseHeader()    

    try {

        const request = await axios.get(
            `https://mcs.us1.twilio.com/v1/Services/${context.CHAT_SID}/Media/${event.mediaSid}`,
            { headers: {
                  'Content-type': 'application/json',
                  'Authorization': 'Basic ' + Buffer.from(context.ACCOUNT_SID + ":" + context.AUTH_TOKEN).toString('base64')
            }}
    
        );
        
        console.log("Response.data.links.temp is ", request.data.links.content_direct_temporary);        

        response.appendHeader('Content-Type', 'application/json');
        response.setBody({contentUrl:request.data.links.content_direct_temporary});                                     
        callback(null, response);  

    } catch(err) {
        
        console.log("Error in media url => ",err);      
        response.appendHeader('Content-Type', 'application/json');
        response.setBody(err);
        response.setStatusCode(err.status);
        return callback(null, response);

    };       

};