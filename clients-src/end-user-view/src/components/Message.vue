<script>
import { computed, ref, onBeforeMount, onMounted, toRaw } from 'vue'
import { formatDate } from '../composables/formatDate.js'
import { formatAuthor } from '../composables/formatAuthor.js'
import { useEndUserStore } from '../stores/endUserStore' 

    export default {
    
        props: ['author','content','dateCreated','cSid', 'media'],
        setup(props) {

            const endUserStore = useEndUserStore();

            const author = props.author;
            const content = props.content;
            const dateCreated = props.dateCreated;
            const cSid = props.cSid;
            const media = props.media;
            const buttonConfig = ref({id:null, title:null, options:[]});

            const parseButtonMessage = () => {
                // **chatButton**[]id[]title[]label|value|style#label|value|style
                // **chatButton**[]1244d[]Are you happ?[]Yes|yes|success#No|no|danger
                let parseArray = content.split(/\[\]/);
                buttonConfig.value.id = parseArray[1];
                buttonConfig.value.title = parseArray[2];
                console.log("parseArray[3] => ", parseArray[3]);
                let optionsArray = parseArray[3].split(/\#/);
                console.log("optionsArray.length => ", optionsArray.length);
                for (let i = 0; i < optionsArray.length; i++) {
                    let oa = optionsArray[i].split(/\|/);                    
                    let o = {
                        label: oa[0],
                        value: oa[1],
                        style: oa[2]
                    }           
                    buttonConfig.value.options.push(o);
                }
            }


            const isButtonMessage = computed(() => {
                console.log("content => ", content);
                if (content !== null && content !== undefined && content.includes("**chatButton**")) {                                        
                    parseButtonMessage();
                    return true;
                } else {
                    return false;
                }        
            });            

            const isCustomer = computed(() => {
                if (author.startsWith("+") || author.startsWith("whatsapp") || author.startsWith("EndUser:")) {                    
                    return true;
                } else {
                    return false;
                }        
            });

            const isEndUserChat = computed(() => {
                if (author.startsWith("EndUser:")) {                    
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
    
            const isMedia = computed(() => {
                if (content === null && media !== null) {                
                    return true;
                } else {
                    return false;
                }        
            });

            const imageUrl = ref("/placeholder.png");

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

            function answerQuestion(id,title,answer) {
                alert(`Participant ID => ${endUserStore.endUser.name}\n\nQuestion ID => ${id}\n\nQuestion => ${title}\n\nAnswer => ${answer}`)
            }

            return {
                author, content, media, dateCreated, isEndUserChat, isCustomer, isBot, isMedia, isButtonMessage, buttonConfig,
                formatDate:formatDate, formatAuthor:formatAuthor, imageUrl, answerQuestion
            }
        }
    }

</script>
<template>
    <div>
        <div v-if="!isButtonMessage">                          
            <div class=" text-start mb-2" v-if="isCustomer">                          
                <div class="text-start mb-2" v-if="!isEndUserChat">  
                    <span class="fs-4 fw-bold badge bg-light text-dark text-wrap text-start"><i class="bi-phone"></i> 
                        <span v-if="!isMedia" class="ms-2">{{content}}</span>
                        <span v-if="isMedia"><img :src="imageUrl" style="max-height:300px;max-width:300px;" class="ms-2 img-fluid rounded" /></span>            
                    </span>
                    <br />
                    <small><span class="fst-italic">{{author}} - {{formatDate(dateCreated)}}</span></small>
                </div>
                <div class=" text-start mb-2" v-if="isEndUserChat">  
                    <span class="fs-4 fw-bold badge bg-light text-dark text-wrap text-start"><i class="bi-person-workspace"></i> 
                        <span v-if="!isMedia" class="ms-2">{{content}}</span>
                        <span v-if="isMedia"><img :src="imageUrl" style="max-height:300px;max-width:300px;" class="ms-2 img-fluid rounded" /></span>            
                    </span><br />
                    <small><span class="fst-italic">{{formatAuthor(author)}} - {{formatDate(dateCreated)}}</span></small>
                </div>
            </div>
            <div v-if="!isCustomer">
                <div class="text-end mb-2" v-if="isBot">                  
                    <span class="fs-4 fw-bold badge bg-secondary text-wrap text-end">{{content}} <i class="bi-robot"></i></span><br />
                    <small><span class="fst-italic">Webhook - {{formatDate(dateCreated)}}</span></small>
                </div>
                <div class=" text-end mb-2" v-if="!isBot">                  
                    <span class="fs-4 fw-bold badge bg-success text-wrap  text-end">
                        <i class="bi-person-workspace"></i>
                        <span v-if="!isMedia" class="ms-2">{{content}}</span>
                        <span v-if="isMedia"><img :src="imageUrl" style="max-height:300px;max-width:300px;" class="ms-2 img-fluid rounded" /></span>                
                    </span><br />
                    <small><span class="fst-italic">{{author}} - {{formatDate(dateCreated)}}</span></small>
                </div>
            </div> 
        </div>    
        <div v-if="isButtonMessage" class="mb-5">
            <h5>{{buttonConfig.title}}</h5>
            <div class="btn-group d-flex" role="group" aria-label="...">
                <button v-for="b in buttonConfig.options" v-bind:key="b.value" class="btn" :class="[b.style]" @click="answerQuestion(buttonConfig.id,buttonConfig.title,b.value)">{{b.label}}</button>
            </div>
        </div> 
    </div>
</template>




