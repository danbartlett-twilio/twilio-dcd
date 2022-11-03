export function returnPartipantAttributes(channel,userType, displayName) {        
    
    let attributes = {
        displayName: displayName,
        sms:false,
        chat:false,
        whatsapp:false,
        enduser:false,
        agent:false,
        bot:false,
    };
    
    switch (channel) {
        case 'sms':
            attributes.sms = true;
            break;
        case 'chat':
            attributes.chat = true;
            break;
        case 'whatsapp':
            attributes.whatsapp = true;
            break;
        default:
    };
        
    switch (userType) {
        case 'enduser':
            attributes.enduser = true;
            break;
        case 'agent':
            attributes.agent = true;
            break;
        case 'bot':
            attributes.bot = true;
            break;            
        default:
    };    
    
    return JSON.stringify(attributes);

};