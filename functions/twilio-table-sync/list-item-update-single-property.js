/*

  list-item-update-single-property.js

  Update a specific property in a specific item  in list given list SID, item index, 
  property key/value

*/

// ADD Helper file to consistently format response header
const rsp = require(Runtime.getFunctions()['twilio-table-sync/system/format-response-headers'].path);

exports.handler = async function(context, event, callback) {

  const client = context.getTwilioClient();

  // Pull the response object from helper library
  const response =  await rsp.formatResponseHeader()  

  console.log('event => ', event);
  console.log('event.targetList => ', event.targetList);
  console.log('event.targetItemIndex => ', event.targetItemIndex);
  console.log('event.targetProperty => ', event.targetProperty);
  console.log('event.targetPropertyValue => ', event.targetPropertyValue);

  client.sync.services(context.TWILIO_SYNC_SERVICE_SID)
      .syncLists(event.targetList)
      .syncListItems
      .list({limit: 500})
      .then(function(result) {
        console.log(result);
        // find object by INDEX
        let targetItem = result.find(({index}) => index === parseInt(event.targetItemIndex))
        console.log("targetItem => ", targetItem);

        // set targetProperty to updated value        
        targetItem.data[event.targetProperty] = event.targetPropertyValue;
        
        // now call to update the list item
        client.sync.services(context.TWILIO_SYNC_SERVICE_SID)
        .syncLists(event.targetList)            
          .syncListItems(parseInt(event.targetItemIndex))
          .update({data: targetItem.data})
          .then(() => {
            response.appendHeader('Content-Type', 'application/json');
            response.setBody(event);              
            callback(null,response);
          })
    })  
    .catch(err => {
      console.log(err.status);      
      response.appendHeader('Content-Type', 'plain/text');
      response.setBody(err);
      response.setStatusCode(500);
      return callback(null, response);
    });            

};
