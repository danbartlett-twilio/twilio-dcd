<script setup>
  import { ref, reactive, onBeforeMount } from 'vue'
  import { useRoute, useRouter } from 'vue-router'  
  import { useEndUserStore } from '../stores/endUserStore' 
  import { Client } from '@twilio/conversations';
  import { returnPartipantAttributes } from '../composables/returnParAttributes.js'
  import Message from './Message.vue'

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
  const addAgent = ref(false);
  const addAgentName = ref("");    
  const addMobile = ref(false);
  const addMobileNumber = ref("");       
  const currentAgentSid = ref("");
          
  let conversationsClient = null;
  let twilioConversation = null;
  
  const conversationsReady = ref(true);
  const statusString = ref("");
  const clientStatus = ref("");

  const connectToConversation = async () => {        
    
    try {
      conversationsClient = await new Client(endUserStore.endUser.accessToken);
    } catch (e) {
      console.log ("failed to connect to conversation => ", e);
      return;
    }
    
    console.log("in connectToConversation and conversationsClient => ", conversationsClient);
    
    if (conversationsClient.connectionState === 'denied') {
      refreshToken();
      return;
    }

    conversationsClient.on('initialized', async () => {
      console.log("conversationsClient => ", conversationsClient);
      try {
        twilioConversation = await conversationsClient.getConversationBySid(conversationId);
      } catch (e) {
        console.log ("failed to getConversation => ", e);
        isConnected.value = true;
        isConversationEnded.value = true;
        endUserStore.logout();
      return;
      }
      console.log("twilioConversation => ", twilioConversation);
      isConnected.value = true;
      twilioConversation.on('messageAdded',message => {
        console.log("message ==> ", message);        
        messages.value.unshift(message);   
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
    await twilioConversation.sendMessage(m);          
    newChatMessage.value = '';
    console.log("Sent Message...");
  }

  const sendImage = ref(false);
  const file = ref(null)

  const handleFileUpload = async() => {

    const sendMediaOptions = {
      contentType: file.value.files[0].type,
      filename: file.value.files[0].name,
      media: file.value.files[0]
    };

    await twilioConversation.prepareMessage().addMedia(sendMediaOptions).build().send();
    sendImage.value = false;
    file.value = ref(null)

  }  

  const getConversationDetails = async () => {
    
    try {                
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-details?sid=${conversationId}`;
      const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
      if (res.ok) {
        let r = await res.json();
        console.log("in getConversationDetails and r => ", r);
        conversationDetails.details = r;
      }
      
    } catch (e) { console.log("getConversationDetails error => ", e); }      

  }

  const getConversationMessages = async () => {
    
    try {                
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-messages?sid=${conversationId}`;
      const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
      if (res.ok) {
        let r = await res.json();
        console.log("getConversationMessages response ==> ", r);        
        messages.value = r.reverse();      
      }
      
    } catch (e) { console.log("getConversationMessages error => ", e); }      

  }  



  const getConversationResources = async () => {                
      
    await getConversationDetails();
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
              <div v-if="isConnected && !isConversationEnded" class="alert alert-primary">
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
            <div class="bg-warning rounded" style="min-height:200px;">
              <div ref="messagesDiv" class="container-fluid pt-3 pb-3">
                <message v-for="m in messages" v-bind:key="m.sid" v-bind:dateCreated="m.dateCreated" v-bind:author="m.author" v-bind:content="m.body" v-bind:cSid="conversationDetails.details.sid" v-bind:media="m.media"></message>
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