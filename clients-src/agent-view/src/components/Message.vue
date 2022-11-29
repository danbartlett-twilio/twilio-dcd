<script>
    import { ref, computed, onMounted, toRaw } from 'vue'
    import { formatDate } from '../composables/formatDate.js'
    import { formatAuthor } from '../composables/formatAuthor.js'
    import { getMediaUrl } from '../composables/getMediaUrl.js'

    export default {
    
        props: ['author','content','dateCreated','cSid','participant', 'mSid', 'pSid','media', 'mAttributes'],
        setup(props) {            

            const author = props.author;
            const content = props.content;
            const media = props.media;
            const dateCreated = props.dateCreated;
            const cSid = props.cSid;
            const mSid = props.mSid;
            const pSid = props.pSid;
            const mAttributes = props.mAttributes;
            const participant = props.participant;

            const confirmDelete = ref(false);

            const imageUrl = ref("/placeholder.png");


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
                    (participant != undefined && participant.agent != undefined && participant.agent) ||
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
                        imageUrl.value = await getMediaUrl(mediaSid);    
                    }

                }                
            });
                        
            return {
                author, content, dateCreated, participant,
                mSid, pSid, isMedia, mAttributes, imageUrl,
                isChatButton, isSms, isChat, isCustomer, isBot, isWhatsapp, isAgent,
                formatDate:formatDate, formatAuthor:formatAuthor, confirmDelete
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
            msid => {{mSid}}<br />
            mAttributes => {{mAttributes}} <br />
            isChatButton => {{isChatButton}} 
        </p>-->
        <div v-if="!isChatButton" class="bg-info text-start mb-2" :class="{ 'text-start': isCustomer,'text-end': !isCustomer  }">                                  
            <span class="fs-4 fw-bold badge text-wrap" :class="{ 'text-start': isCustomer,'text-end': !isCustomer,'bg-light': isCustomer,'text-dark': isCustomer, 'bg-success': isAgent, 'bg-secondary': isBot  }">
                <i v-if="isSms" class="bi-phone"></i> 
                <i v-if="isChat" class="bi-person-workspace"></i>
                <i v-if="isWhatsapp" class="bi-whatsapp"></i> 
                <i v-if="isBot" class="bi-robot"></i> 
                <span v-if="!isMedia" class="ms-2">{{content}}</span>
                <span v-if="isMedia"><img :src="imageUrl" style="max-height:300px;max-width:300px;" class="ms-2 img-fluid rounded" /></span>
            </span>
            <p class="mt-1">
                <small>
                    <span class="fst-italic">{{author}} - {{formatDate(dateCreated)}}</span>
                    <button v-show="!confirmDelete" @click="confirmDelete = true" class="btn btn-link"><i class="bi-trash"></i></button>                                    
                    <button v-show="confirmDelete" @click="$emit('removeMessage',mSid)" class="btn btn-danger ms-2 me-2">Delete?</button>
                    <button v-show="confirmDelete" @click="confirmDelete = false" class="btn btn-light">Cancel</button>
                </small>
            </p>            
        </div>        
        <div v-if="isChatButton" class="text-start mb-4">                                  
            <div v-if="mAttributes.mType === 'chatButton'">
                <h5>{{mAttributes.question}}</h5>
                <div class="btn-group d-flex " role="group" aria-label="...">
                    <button disabled @click="answerQuestion(mAttributes.id,mAttributes.question,b.value,b.style)" v-for="b in mAttributes.options" v-bind:key="b.value" class="border btn" :class="[b.style]">{{b.label}}</button>
                </div>            
            </div>
            <div v-if="mAttributes.mType === 'chatButtonResponse'">
                <h5>
                    <span class="fst-italic">{{mAttributes.title}}</span> {{mAttributes.person}} replied:                
                    <button disabled class="btn" :class="[mAttributes.style]">{{mAttributes.answer}}</button>
                </h5>                                    
            </div>                        
        </div>          

    </div>
</template>


