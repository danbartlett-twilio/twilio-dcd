import { ref, computed } from "vue";

export function useMessageComputed(participant, author, mAttributes, cSid, content, media) {
    
    const isChatButton = computed(() => {
        //console.log("mAttributes => ", mAttributes)
        if(Object.keys(mAttributes).length === 0) {
            //console.log("mAttributes.mType no keys ")
            return false;
        } else {
            if (mAttributes.mType !== undefined &&  mAttributes.mType.startsWith("chatButton") ) {    
                //console.log("t mAttributes.mType => ", mAttributes.mType)
                return true;
            } else {
                return false;
                //console.log("t mAttributes.mType => ", mAttributes.mType)
            }
        }                     
    });

    const isCustomer = computed(() => {
        if (
            (participant != undefined && participant.enduser != undefined && participant.enduser) || 
            ( ( author.startsWith("+") || author.startsWith("whatsapp") ) && !participant.agent ) ||
            (mAttributes.mType !== undefined && mAttributes.mType === "clientChat") ) 
        {                    
            return true;
        } else {
            return false;
        }        
    });
    
    const isChat = computed(() => {
        if (
            (participant != undefined && participant.chat != undefined && participant.chat) ||
            (mAttributes.mType !== undefined && mAttributes.mType === "agentChat") ||
            (mAttributes.mType !== undefined && mAttributes.mType === "clientChat") )
        {                    
            return true;
        } else {
            return false;
        }        
    });

    const isBot = computed(() => {
        if (author === cSid) {
            return true;
        } else {
            return false;
        }        
    });
    
    const isAgent = computed(() => {
        if (
            (participant != undefined && participant.agent != undefined && participant.agent == true) ||
            (mAttributes.mType !== undefined && mAttributes.agentMessage === true))

        {                                    
            return true;
        } else {
            return false;
        }        
    });

    const isSms = computed(() => {
        if ((participant != undefined && participant.sms != undefined && participant.sms) || ( author.startsWith("+") ) ) {                    
            return true;
        } else {
            return false;
        }        
    });
    
    const isWhatsapp = computed(() => {
        if ((participant != undefined && participant.whatsapp != undefined && participant.whatsapp) || ( author.startsWith("whatsapp") ) ) {                    
            return true;
        } else {
            return false;
        }        
    });

    const isMedia = computed(() => {
        if (content === null && media !== null) {                
            return true;
        } else {
            return false;
        }        
    });

    return { isChatButton, isCustomer, isChat, isBot, isAgent, isSms, isWhatsapp, isMedia };

}
