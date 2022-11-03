<script setup>  
  import { ref, computed } from 'vue'
  import { RouterLink } from 'vue-router'
  import { useEndUserStore } from '../stores/endUserStore' 
  import { returnPartipantAttributes } from '../composables/returnParAttributes.js'

  const endUserStore = useEndUserStore();

  const newConversationName = ref("");
  const addConversation = ref(false);    
  const conversationCreated = ref(false);     
  const newConversationSid = ref("notset")
  const showToken = ref(false);    
  const refreshingToken = ref(false);    
  const tokenRefreshed = ref(false);    

  const hasConversation = computed(() => {
      if (endUserStore.endUser != undefined && endUserStore.endUser.activeConversation !== '' && endUserStore.endUser.activeConversation !== 'none') {                    
          return true;
      } else {
          return false;
      }        
  });  

  const refreshToken = async () => {
    refreshingToken.value = true;
    await endUserStore.getToken();
    refreshingToken.value = false;
    tokenRefreshed.value = true;
  };

  const createNewConversation = async () => {

    try {                
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-create`;
      const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": {conversationName: 'InboundChat: '+newConversationName.value} }) });
      if (res.ok) {          
        console.log("Success! Created a new conversation...");                
        let r = await res.json();
        endUserStore.endUser.name = "EndUser:"+newConversationName.value;
        newConversationSid.value = r.sid;        
        addConversation.value = false;
        await endUserStore.getToken();
        await addEndUserToConversation();
        conversationCreated.value = true; 
        endUserStore.endUser.activeConversation = r.sid; 
           
      } else {
        console.log("Error! Unable to create new conversation...");                
      }             
      
    } catch (e) { console.log("createNewConversation error => ", e); }  
  
  }

  const addEndUserToConversation = async () => {
    
    try {                
      let attributes = returnPartipantAttributes('chat','enduser', newConversationName.value);
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-add-participant`;
      const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": {conversationSid: newConversationSid.value, identity:'EndUser:'+newConversationName.value, attributes:attributes} }) });
      if (res.ok) {          
        console.log("Success! Added End User to conversation...");                               
      } else {
        console.log("Error! Unable to add End User to conversation...");                
      }             
      
    } catch (e) { console.log("addEndUserToConversation error => ", e); }      

  }   

  function logout() {
    endUserStore.logout();
    showToken.value = false;    
    refreshingToken.value = false;    
    tokenRefreshed.value = false;    
  }  

</script>

<template>
  <div class="container-fluid">

        <div class="row pb-5 mb-5">
          <div class="col">            
            <h2 class="mb-5">Twilio Conversations Web Chat Demo!</h2>

            <p class="lead fs-4 mb-5">
              With this demo, you can experience a custom web chat 
              client powered by Twilio Conversations.
            </p>

            <p class="lead fs-4 mb-5" v-show="!hasConversation">
              Initiate a conversation from a web chat client.           
              Click the <b><i>Start New Chat Conversation</i></b>
              button below.
            </p>

            <p class="lead fs-4 mb-5" v-show="hasConversation">
              You have an active conversation. Click the 
              <b><i>Start Chatting</i></b> button below.
            </p>

            <div v-show="hasConversation" class="mb-5 text-center">
              <router-link :to="{ name: 'conversation', params: { sid: endUserStore.endUser.activeConversation } }" custom v-slot="{ navigate }">
                  <button class="btn btn-lg btn-primary" @click="navigate">
                    <i class="bi-chat-left-dots-fill"></i>
                    Start Chatting
                  </button>
              </router-link>
            </div>
            <div v-show="!hasConversation" class="mb-5 text-center">
              <button v-show="!addConversation" class="btn btn-lg btn-success" @click="addConversation = true">
                <i class="bi-chat-left-dots-fill"></i>
                Start New Chat Conversation
              </button>
              <div v-show="addConversation">
                <div class="mb-3">
                  <label for="exampleFormControlInput1" class="form-label">Enter Your Name</label>
                  <input type="text" v-model="newConversationName" class="form-control" id="exampleFormControlInput1" placeholder="">
                </div>
                <div class="d-grid">
                  <button @click="createNewConversation()" class="btn btn-success btn-lg">
                    <i class="bi-lightning"></i>
                    Initiate Chat Session
                  </button>
                </div>               
              </div>            
            </div>

            <div class="card text-dark bg-info mb-5" >
              <div class="card-header fs-4"><b>Access Token</b></div>
              <div class="card-body">                
                <p class="card-text fs-5">
                  In order order to enter a conversation, you need a valid
                  access token.                  
                </p>
                <p class="card-text fs-5" v-show="!hasConversation">
                  Start a new conversation by clicking the button above.
                </p>
                <p>

                  <button v-show="endUserStore.endUser.accessToken!='' && !tokenRefreshed" @click="refreshToken()" class="btn btn-secondary">
                    <span v-show="!refreshingToken">
                      <i class="bi-recycle"></i>
                      Refresh Token
                    </span>
                    <div class="spinner-border" role="status" v-show="refreshingToken">
                      <span class="visually-hidden">Loading...</span>
                    </div>                    
                  </button>
                  <button v-show="tokenRefreshed" disabled class="btn btn-success">                    
                    <i class="bi-check"></i>
                    Token Refreshed
                  </button>                  
                  <button v-show="endUserStore.endUser.accessToken!=''" @click="showToken = !showToken" class="btn btn-light ms-2">
                    <i class="bi-eye"></i>
                    View Token
                  </button>
                </p>
                <p v-show="showToken" class="text-break">
                  <i>{{endUserStore.endUser.accessToken}}</i>
                </p>
                <p>
                  <button v-show="hasConversation" @click="logout()" class="btn btn-danger float-end">
                    <i class="bi-box-arrow-left"></i>
                    Logout
                  </button>                  
                </p>
              </div>
            </div>

          </div>
          <div class="col">
            
            <div class="text-center">
              <img class="img-fluid" style="max-width:450px;" src="https://twilio-cms-prod.s3.amazonaws.com/images/diagram-conversat.width-1200.format-webp.webpquality-75.webp" />
            </div>

          </div>
        </div>
      </div>

</template>