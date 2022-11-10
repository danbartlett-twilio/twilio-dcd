<script setup>
  import { ref, reactive, computed, onBeforeMount } from 'vue'
  import { useRoute, useRouter } from 'vue-router'  
  import { useEndUserStore } from '../stores/endUserStore' 
  import { Client } from '@twilio/conversations';
  import { returnPartipantAttributes } from '../composables/returnParAttributes.js'
  import Message from './Message.vue'
  import ChatMessage from './ChatMessage.vue'

  const endUserStore = useEndUserStore();

  const route = useRoute();
  const conversationId = (route.params.sid) ? route.params.sid : 'Not Found';
  
  const messages = ref([]);
  const conversationDetails = reactive({details:{}});
  
  const inConversation = ref(true);
  const isConnected = ref(false);
  const isTokenExpired = ref(false);
  const isConversationEnded = ref(false);
  const refreshingToken = ref(false);

  const newChatMessage = ref("");      
          
  let conversationsClient = null;
  let twilioConversation = null;
  
  const conversationsReady = ref(true);
  const statusString = ref("");
  const clientStatus = ref("");

  const isChatChannel = ref(false);

  const connectToConversation = async () => {        
    
    try {
      conversationsClient = await new Client(endUserStore.endUser.accessToken);
    } catch (e) {
      console.log ("failed to connect to conversation => ", e);
      return;
    }
    
    //console.log("in connectToConversation and conversationsClient => ", conversationsClient);
    
    if (conversationsClient.connectionState === 'denied') {
      refreshToken();
      return;
    }

    conversationsClient.on('initialized', async () => {
      //console.log("conversationsClient => ", conversationsClient);
      try {
        twilioConversation = await conversationsClient.getConversationBySid(conversationId);
      } catch (e) {
        console.log ("failed to getConversation => ", e);
        isConnected.value = true;
        isConversationEnded.value = true;
        endUserStore.logout();
      return;
      }
      //console.log("twilioConversation => ", twilioConversation);
      isConnected.value = true;
      twilioConversation.on('messageAdded',message => {        
        //console.log("New Message Added ==> ", message);
        let pa = participantAttributeHash.value[message.participantSid];
        if (pa == undefined) {
          pa = JSON.parse(returnPartipantAttributes('bot','bot', "Webhook"));
          message.participantAttributes = pa;
        } else {
          message.participantAttributes = pa;
        }                
        messages.value.unshift(message);   
      });
      twilioConversation.on('messageRemoved', obj => {        
        console.log("Message Removed from conversation...");
        getConversationMessages();
      });                
  
    });    
    conversationsClient.on('tokenExpired', obj => {
        console.log("Token Expired!");
        isConnected.value = false;
        isTokenExpired.value = true;
    });    

    conversationsClient.on('disconnected', obj => {
        console.log("Conversations disconnected!");
        isConnected.value = false;
        isTokenExpired.value = true;
    });     

    conversationsClient.on('conversationRemoved', obj => {
        console.log("Conversations removed!");
        isConversationEnded.value = true;
        endUserStore.logout();
    });     
    await getConversationMessages(); 
  }

  const refreshToken = async () => {
    console.log("in refreshToken...");
    refreshingToken.value = true;
    try {
      await endUserStore.getToken();          
      await connectToConversation();
      refreshingToken.value = false;
    } catch (e) {
      console.log ("failed to refresh token => ", e);
    }

  };   

  const sendMessage = async () => {                           
    let m = newChatMessage.value;
    newChatMessage.value = '...';
    let attributes = {
        mType: 'clientChat',
        author: endUserStore.endUser.name,
    }
    await twilioConversation.prepareMessage().setBody(m).setAttributes(attributes).build().send();              
    newChatMessage.value = '';
    console.log("Sent Message...");
  }

  const sendImage = ref(false);
  const file = ref(null)

  const handleFileUpload = async() => {

    let attributes = {
        mType: 'clientChat',
        author: endUserStore.endUser.name,
    }

    const sendMediaOptions = {
      contentType: file.value.files[0].type,
      filename: file.value.files[0].name,
      media: file.value.files[0]
    };

    await twilioConversation.prepareMessage().setAttributes(attributes).addMedia(sendMediaOptions).build().send();
    sendImage.value = false;
    file.value = ref(null)

  }  

  const getConversationDetails = async () => {
    
    try {                
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-details?sid=${conversationId}`;
      const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
      if (res.ok) {
        let r = await res.json();
        //console.log("in getConversationDetails and r => ", r);
        conversationDetails.details = r;
        if (typeof JSON.parse(conversationDetails.details.attributes) === 'object') {
            conversationDetails.details.attributes = JSON.parse(conversationDetails.details.attributes);              
        } else {
          conversationDetails.details.attributes = JSON.parse(JSON.parse(conversationDetails.details.attributes))
        }
        if (conversationDetails.details.attributes.conversationType === "ChatChannel") {
          isChatChannel.value = true;
        }
      }
      
    } catch (e) { console.log("getConversationDetails error => ", e); }      

  }
  
  const participants = ref([]);
  const participantAttributeHash = ref({});
  const getConversationParticipants = async () => {
    
    try {                
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-participants?sid=${conversationId}`;
      const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
      if (res.ok) {
        let r = await res.json();
        //console.log("getConversationParticipants response ==> ", r);        
          participants.value = r;
          for (let i=0;i<participants.value.length;i++) {                            
            //console.log("participants.value[i].identity ==> ", participants.value[i].identity);                        
            
            if (typeof JSON.parse(participants.value[i].attributes) === 'object') {
              participants.value[i].attributes = JSON.parse(participants.value[i].attributes);              
            } else {
              participants.value[i].attributes = JSON.parse(JSON.parse(participants.value[i].attributes))
            }
            
            participantAttributeHash.value[participants.value[i].sid] = participants.value[i].attributes;
          };              
      }
      
    } catch (e) { console.log("getConversationParticipants error => ", e); }      

  }      

  const getConversationMessages = async () => {
    
    try {                
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-messages?sid=${conversationId}`;
      const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
      if (res.ok) {
        let r = await res.json();
        //console.log("getConversationMessages response ==> ", r);        
        messages.value = r.reverse();
        for (let i=0;i<messages.value.length;i++) {  
          if (Object.keys(messages.value[i].attributes).length === 0) {
            messages.value[i].attributes = {attributes:'none'}
          } else {
            messages.value[i].attributes = JSON.parse(messages.value[i].attributes);
          }            
          let pa = participantAttributeHash.value[messages.value[i].participantSid];
          if (pa == undefined) {
            pa = JSON.parse(returnPartipantAttributes('bot','bot', "Webhook"));
            messages.value[i].participantAttributes = pa;
          } else {
            messages.value[i].participantAttributes = pa;
          }          
        }              
      }
      
    } catch (e) { console.log("getConversationMessages error => ", e); }      

  }  

  const sendAnswer = async (o) => {
    try {   
      let attributes = {
        mType: 'chatButtonResponse',
        id: o.id,
        title: o.title,
        answer: o.answer,
        person: o.person,
        style: o.style        
      }
      await twilioConversation.prepareMessage().setBody("<Chat Button Response>").setAttributes(attributes).build().send();              
      //console.log("Returned Chat Button Response...");
    } catch (e) {       
      isConnected.value = false;
      console.log("Chat Button Response Error => ", e); 
    }       
    
  }                

  const getConversationResources = async () => {                
      
    await getConversationDetails();
    await getConversationParticipants();
    await getConversationMessages();

  }

  onBeforeMount(async () => {

    await getConversationResources();
    await connectToConversation();

  });

</script>

<template>
    <div class="container">      
      <div class="row row-height mt-2" >

        <div class="col-1 pb-5">&nbsp;</div>
        <div class="col-10 pb-5">
          <p class="pb-0 mb-0 fs-4 fw-bold fst-italic">{{conversationDetails.details.friendlyName}}</p>                        
          <div class="pb-5">
            <div v-if="inConversation">
              <div v-show="!isConnected" class="alert alert-danger">
                <button v-show="!isTokenExpired" type="button" class="btn btn-sm btn-danger float-end" @click="connectToConversation()"><i class="bi-plug"></i> Connect</button>
                <h5 class="alert-heading">Not Connected</h5>
                <p v-show="!isTokenExpired">Connecting automatically...</p>   
                <p v-show="!isTokenExpired">
                  Trouble connecting?
                  <router-link to="/">Refresh Token</router-link>
                </p>
                <div v-show="isTokenExpired">
                  <p>
                    <b>Your token has expired!</b> 
                  </p>
                  
                  <button v-show="!refreshingToken" class="btn btn-lg btn-danger" @click="refreshToken()">
                    <i class="bi-recycle"></i>
                    Refresh Token
                  </button>                  
                  <div v-show="refreshingToken" class="spinner-border text-info mt-5" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>                                
              </div>            
              <div v-show="isConnected && isConversationEnded" class="alert alert-danger">
                <h2 class="alert-heading mb-3">This conversation has ended!</h2>
                <h5 class="alert-heading mb-5">
                  You can return to the home page to start a new Conversation.
                </h5>
                <router-link class="btn btn-primary" to="/">
                  <i class="bi-house"></i>
                  Home
                </router-link>
              </div>              
              <div v-if="isConnected && !isConversationEnded" class="alert" :class="{'alert-warning':isChatChannel,'alert-primary':!isChatChannel}">
                  <form v-on:submit.prevent="submitForm">
                    <div class="input-group">    
                      <input  v-on:keyup.enter="sendMessage()" type="text" class="form-control" v-model="newChatMessage" aria-describedby="btnGroupAddon">
                      <button type="button" class="btn btn-primary" @click="sendMessage()"><i class="bi-lightning"></i> SEND</button>
                    </div>              
                  </form>
                  <div v-show="!sendImage" class="mt-1 text-end">   
                    <button @click="sendImage = true" class="btn btn-sm btn-link">                                           
                      <i class="bi-image"></i>
                      Send Image                      
                    </button>
                  </div>
                  <div v-show="sendImage" class="mt-3">                  
                    <input ref="file" v-on:change="handleFileUpload()" class="form-control form-control-sm" id="formFileSm" type="file">
                  </div>                               
                  <div v-show="sendImage" class="text-end">   
                    <button @click="sendImage = false" class="btn btn-sm btn-link">                                           
                      Cancel                      
                    </button>
                  </div>                                  
              </div>                        
            </div>
            <div class="border rounded" :class="{'bg-light':isChatChannel,'bg-warning':!isChatChannel}" style="min-height:200px;">
              <p v-if="isChatChannel" class="mt-2 ms-2 mb-2 fs-4 fw-bold text-end">
                {{endUserStore.endUser.name}}
                <img :src="endUserStore.endUser.avatar" class="rounded me-2" />                                                
              </p>
              <p v-else class="ms-2 mb-2 fs-4 fw-bold">
                <img v-if="isChatChannel" :src="endUserStore.endUser.avatar" class="rounded float-start me-2" />                
                <i v-else class="bi-person-workspace"></i>
                {{endUserStore.endUser.name}}
              </p>              
              <div v-if="!isChatChannel" ref="messagesDiv" class="container-fluid pt-3 pb-3">
                <message @sendAnswer="(o) => sendAnswer(o)" v-for="m in messages" v-bind:participant="m.participantAttributes" v-bind:mAttributes="m.attributes" v-bind:key="m.sid" v-bind:mSid="m.sid" v-bind:pSid="m.participantSid" v-bind:dateCreated="m.dateCreated" v-bind:author="m.author" v-bind:content="m.body" v-bind:media="m.media" v-bind:cSid="conversationDetails.details.sid"></message>                
              </div>
              <div v-if="isChatChannel" ref="messagesDiv" class="container-fluid pt-3 pb-3">
                <chat-message @sendAnswer="(o) => sendAnswer(o)" v-for="m in messages" v-bind:participant="m.participantAttributes" v-bind:mAttributes="m.attributes" v-bind:key="m.sid" v-bind:mSid="m.sid" v-bind:pSid="m.participantSid" v-bind:dateCreated="m.dateCreated" v-bind:author="m.author" v-bind:content="m.body" v-bind:media="m.media" v-bind:cSid="conversationDetails.details.sid"></chat-message>                
              </div>              
            </div>
            <p class="float-end"><em>{{conversationDetails.details.sid}}</em></p>                        
          </div>


        </div>
      </div>

    </div>
</template>

<style scoped>
  </style>