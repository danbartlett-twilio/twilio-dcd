<script>
    import { ref, computed, onMounted, toRaw } from 'vue'
    import { formatDate } from '../composables/formatDate.js'
    import { formatAuthor } from '../composables/formatAuthor.js'
    import { getMediaUrl } from '../composables/getMediaUrl.js'
    import { useMessageComputed } from '../composables/messageComputed.js'
    import { useEndUserStore } from '../stores/endUserStore' 

    export default {
    
        props: ['author','content','dateCreated','cSid','participant', 'mSid', 'pSid','media', 'mAttributes'],
        setup(props, ctx) {            

            const endUserStore = useEndUserStore();

            const author = props.author;
            const content = props.content;
            const media = props.media;
            const dateCreated = props.dateCreated;
            const cSid = props.cSid;
            const mSid = props.mSid;
            const pSid = props.pSid;
            const mAttributes = props.mAttributes;
            const participant = props.participant;

            const imageUrl = ref("/placeholder.png");

            let { isChatButton, isCustomer, isChat, isBot, isAgent, isSms, isWhatsapp, isMedia } = useMessageComputed(participant, author, mAttributes, cSid, content, media)

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

            function answerQuestion(id,title,answer,style) {                
                alert(`Optionally trigger action in web browser.\n\nfn("${endUserStore.endUser.name}","${id}","${title}","${answer}")`)                
                ctx.emit('sendAnswer', {id:id,title:title,answer:answer,person:endUserStore.endUser.name,style});                
            }
            
            return {
                author, content, dateCreated, participant,
                mSid, pSid, isMedia, mAttributes, imageUrl,
                isChatButton, isSms, isChat, isCustomer, isBot, isWhatsapp, isAgent,
                formatDate:formatDate, formatAuthor:formatAuthor,
                answerQuestion

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

        <div v-if="!isChatButton" class="bg-warning text-start mb-2" :class="{ 'text-start': isCustomer,'text-end': !isCustomer  }">                                  
            <span class="fs-4 fw-bold badge text-wrap" :class="{ 'text-start': isCustomer,'text-end': !isCustomer,'bg-light': isCustomer,'text-dark': isCustomer, 'bg-success': isAgent, 'bg-secondary': isBot  }">
                <i v-if="isSms" class="bi-phone"></i> 
                <i v-if="isChat" class="bi-person-workspace"></i>                
                <i v-if="isWhatsapp" class="bi-whatsapp"></i> 
                <i v-if="isBot" class="bi-robot"></i> 
                <span v-if="!isMedia" class="ms-2">{{content}}</span>
                <span v-if="isMedia"><img :src="imageUrl" style="max-height:300px;max-width:300px;" class="ms-2 img-fluid rounded" /></span>
            </span>
            <p class="mt-1">
                <small><span class="fst-italic">{{author}} - {{formatDate(dateCreated)}}</span></small>
            </p>            
        </div>  
        <div v-if="isChatButton" class="text-start mb-4">                                  
            <div v-if="mAttributes.mType === 'chatButton'">
                <h5>{{mAttributes.question}}</h5>
                <div class="btn-group d-flex " role="group" aria-label="...">
                    <button @click="answerQuestion(mAttributes.id,mAttributes.question,b.value,b.style)" v-for="b in mAttributes.options" v-bind:key="b.value" class="btn border" :class="[b.style]">{{b.label}}</button>
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


