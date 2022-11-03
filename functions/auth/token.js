// ADD Helper file to consistently format response header
const rsp = require(Runtime.getFunctions()['system/format-response-headers'].path);

exports.handler = async function(context, event, callback) {

    // Pull the response object from helper library
    const response =  await rsp.formatResponseHeader()

    const twilioAccountSid = context.ACCOUNT_SID;
    const twilioApiKey = context.API_KEY;
    const twilioApiSecret = context.API_SECRET;
    const identity = event.identity;
    const chatSid = context.CHAT_SID;

    console.log("twilioAccountSid",twilioAccountSid);
    console.log("twilitwilioApiKey",twilioApiKey);
    console.log("twilioApiSecret",twilioApiSecret);
    console.log("identity",identity);
    console.log("chatSid",chatSid);

    const AccessToken = Twilio.jwt.AccessToken;

    const token = new AccessToken(
        twilioAccountSid,
        twilioApiKey,
        twilioApiSecret,
        {identity: identity}
    );
  
    const ChatGrant = AccessToken.ChatGrant;

    const chatGrant = new ChatGrant({
    serviceSid: chatSid,
    });
  
    token.addGrant(chatGrant);

    response.appendHeader('Content-Type', 'application/json');
    response.setBody({accessToken: token.toJwt()});            

    return callback(null, response);
  }
  