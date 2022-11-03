export function returnPartipantAttributes(channel,userType, displayName) {        
    
    let attributes = {
        displayName: displayName,
        sms:false,
        chat:false,
        whatsapp:false,
        enduser:false,
        agent:false
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
        default:
    };    
    
    return JSON.stringify(attributes);

};