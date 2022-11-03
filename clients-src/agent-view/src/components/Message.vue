<script>
    import { ref, computed, onMounted, onBeforeMount, toRaw } from 'vue'
    import { formatDate } from '../composables/formatDate.js'
    import { formatAuthor } from '../composables/formatAuthor.js'
    
    export default {
    
        props: ['author','content','dateCreated','cSid','participant', 'mSid', 'pSid','media'],
        setup(props) {            

            const author = props.author;
            const content = props.content;
            const media = props.media;
            const dateCreated = props.dateCreated;
            const cSid = props.cSid;
            const mSid = props.mSid;
            const pSid = props.pSid;
            const participant = props.participant;

            const imageUrl = ref("/placeholder.png");

            const isCustomer = computed(() => {
                if ((participant != undefined && participant.agent != undefined && !participant.agent) && ( author.startsWith("+") || author.startsWith("whatsapp") || author.startsWith("EndUser:") ) ) {                    
                    return true;
                } else {
                    return false;
                }        
            });

            const isChat = computed(() => {
                if ((participant != undefined && participant.chat != undefined && participant.chat) || author.startsWith("EndUser:")) {                    
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
                if (participant != undefined && participant.agent != undefined && participant.agent) {                                    
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

            const getMediaUrl = async (mediaSid) => {

                try {                
                let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-message-media-url?mediaSid=${mediaSid}`;
                const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
                if (res.ok) {
                    let r = await res.json();                 
                    console.log("getMediaUrl response ==> ", r);
                    imageUrl.value = r.contentUrl;
                }
                
                } catch (e) { console.log("getMediaUrl error => ", e); }      
            };            

            onBeforeMount(() => {
                console.log("In Message Component...");
                console.log("Media => ", media);
            });
            
            onMounted(async () => {
                if (content === null && media !== null) {
                    let mediaSid = null;                    
                    
                    let mcopy = toRaw(media);
                    if (mcopy[0] !== undefined) {
                        mediaSid = mcopy[0].sid;
                    } else if (mcopy.state !== undefined) {
                        mediaSid = mcopy.state.sid;
                    }

                    if (mediaSid !== null && mediaSid !== undefined) {
                        await getMediaUrl(mediaSid);    
                    }

                }                
            });
                        
            return {
                author, content, dateCreated, isSms, isChat, isCustomer, isBot,
                isWhatsapp, isAgent, mSid, pSid, isMedia,
                participant, imageUrl,
                formatDate:formatDate, formatAuthor:formatAuthor
            }
        }
    }

</script>
<template>
    <div>        
        <!--<p>
            participant => {{participant}}<br />
            isCustomer => {{isCustomer}}<br />
            isAgent => {{isAgent}}<br />
            isBot => {{isBot}}<br />
            pSid => {{pSid}}<br />
            msid => {{mSid}} 
        </p>-->
        <div class="bg-info text-start mb-2" :class="{ 'text-start': isCustomer,'text-end': !isCustomer  }">                                  
            <span class="fs-4 fw-bold badge text-wrap" :class="{ 'text-start': isCustomer,'text-end': !isCustomer,'bg-light': isCustomer,'text-dark': isCustomer, 'bg-success': isAgent, 'bg-secondary': isBot  }">
                <i v-if="isSms" class="bi-phone"></i> 
                <i v-if="isChat" class="bi-person-workspace"></i>
                <i v-if="isWhatsapp" class="bi-phone"></i> 
                <i v-if="isBot" class="bi-robot"></i> 
                <span v-if="!isMedia" class="ms-2">{{content}}</span>
                <span v-if="isMedia"><img :src="imageUrl" style="max-height:300px;max-width:300px;" class="ms-2 img-fluid rounded" /></span>
            </span>
            <p class="mt-1">
                <small><span class="fst-italic">{{author}} - {{formatDate(dateCreated)}}</span></small>
            </p>
            
        </div>        
     
    </div>
</template>


