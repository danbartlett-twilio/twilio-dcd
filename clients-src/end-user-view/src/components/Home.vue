<script setup>  
  import { ref, computed } from 'vue'
  import { RouterLink, useRouter } from 'vue-router'
  import { useEndUserStore } from '../stores/endUserStore' 
  import { returnPartipantAttributes } from '../composables/returnParAttributes.js'
  import { formatDate } from '../composables/formatDate.js' 

  const endUserStore = useEndUserStore();
  const router = useRouter();
  const newConversationName = ref("");
  const addConversation = ref(false);    
  const conversationCreated = ref(false);     
  const newConversationSid = ref("notset")
  const joinConversationSid = ref("")
  const showToken = ref(false);    
  const refreshingToken = ref(false);    
  const tokenRefreshed = ref(false);    

  const hasSupportConversation = computed(() => {
      if (endUserStore.endUser != undefined && endUserStore.endUser.supportConversation !== '' && endUserStore.endUser.supportConversation !== 'none') {                    
          return true;
      } else {
          return false;
      }        
  });  

  const hasToken = computed(() => {
      if (endUserStore.endUser != undefined && endUserStore.endUser.accessToken !== '') {                    
          return true;
      } else {
          return false;
      }        
  });  

  const hasName = computed(() => {
      if (endUserStore.endUser != undefined && endUserStore.endUser.name !== '') {                    
          return true;
      } else {
          return false;
      }        
  });  

  function randomIntFromInterval(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  const newName = ref("");
  const saveName = async () => {    
    endUserStore.endUser.name = newName.value;
    let n = randomIntFromInterval(1,700);
    endUserStore.endUser.avatar = `https://picsum.photos/id/${n}/50`
  };

  const refreshToken = async () => {
    refreshingToken.value = true;
    await endUserStore.getToken();
    refreshingToken.value = false;
    tokenRefreshed.value = true;
    await getConversations();
  };

  const conversationType = ref("Support");     
  const conversationTypes = ref(["Support", "ChatChannel"]); 

  const createNewConversation = async () => {

    try {                
      let attributes = {
        conversationType: conversationType.value,
        createdBy: endUserStore.endUser.name
      }
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-create`;
      const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": {conversationName: endUserStore.endUser.name+' (inbound chat)', attributes:attributes} }) });
      if (res.ok) {          
        console.log("Success! Created a new conversation...");                
        let r = await res.json();        
        joinConversationSid.value = r.sid;        
        addConversation.value = false;
        await endUserStore.getToken();
        await addEndUserToConversation();
        conversationCreated.value = true; 
        endUserStore.endUser.supportConversation = r.sid; 
           
      } else {
        console.log("Error! Unable to create new conversation...");                
      }             
      
    } catch (e) { console.log("createNewConversation error => ", e); }  
  
  }

  const addEndUserToConversation = async () => {
    
    try {                
      let attributes = returnPartipantAttributes('chat','enduser', endUserStore.endUser.name, endUserStore.endUser.avatar);
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-add-participant`;
      const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": {conversationSid: joinConversationSid.value, identity:endUserStore.endUser.name, attributes:attributes} }) });
      if (res.ok) {          
        console.log("Success! Added End User to conversation...");                               
      } else {
        console.log("Error! Unable to add End User to conversation...");                
      }             
      
    } catch (e) { console.log("addEndUserToConversation error => ", e); }      

  }   

  const conversations = ref([]);
  const conversationsFiltered = ref([]);

  const getConversations = async () => {
    
    try {                
      conversationsFiltered.value = [];
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/return-conversations`;
      const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
      if (res.ok) {
        let r = await res.json();
        //console.log("in getConversations and r => ", r);
        conversations.value = r;
        for (let i=0;i<conversations.value.length;i++) {                
          if (Object.keys(conversations.value[i].attributes).length > 0) {
            conversations.value[i].attributes = JSON.parse(conversations.value[i].attributes);              
          };          
          if (conversations.value[i].attributes.conversationType === undefined || conversations.value[i].attributes.conversationType === '') {
            conversations.value[i].attributes.conversationType = "Support";
          }          
          if (conversations.value[i].friendlyName === null || conversations.value[i].friendlyName === '') {
            conversations.value[i].friendlyName = "no name...";
          }
          if (conversations.value[i].attributes.conversationType === 'ChatChannel') {
            conversationsFiltered.value.push(conversations.value[i]);
          }
        };         

      }
      
    } catch (e) { console.log("getConversations error => ", e); }      

  }

  const joinAndEnter= async function(sid) {
    joinConversationSid.value = sid;
    await addEndUserToConversation();
    router.push({ name: 'conversation', params: { sid: sid } })
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
          
          <div class="col-8">            
            <h2 class="mb-5">Twilio Conversations Web Chat Demo!</h2>

            <div class="alert alert-info mb-5 fs-5 fw-bold text-center">
              With this demo, you can experience a custom web chat 
              client powered by Twilio Conversations.
            </div>

            <div class="card mb-5" :class="{'text-bg-success':hasToken, 'text-bg-warning':!hasToken}">
              <div class="card-header fs-2"><b>Access Token</b></div>
              <div class="card-body">   
                <h3 v-show="hasName" class="card-title mb-5">
                  <img :src="endUserStore.endUser.avatar" class="rounded float-start me-2" />
                  {{endUserStore.endUser.name}}
                </h3>             
                <p v-show="!hasName" class="card-text fs-4 mb-5">
                  In order order to enter a conversation, you to enter a name
                  and then create an access token.                  
                </p>
                <div v-show="!hasName">
                  <div class="mb-3">
                    <label for="newname" class="form-label"><h4>Enter Your Name</h4></label>
                    <input type="text" v-model="newName" class="form-control" id="newname" placeholder="">
                  </div>
                  <div class="d-grid">
                    <button @click="saveName()" class="btn btn-primary btn-lg">
                      <i class="bi-save"></i>
                      Save Name
                    </button>
                  </div>                     
                </div>
                <div v-show="hasName && !hasToken">
                  <p class="card-text fs-4 mb-5">
                    Great, now create an access token...                  
                  </p>                  
                  <button @click="refreshToken()" class="btn btn-primary btn-lg">
                    <span v-show="!refreshingToken">
                      <i class="bi-coin"></i>
                      Create Token
                    </span>
                    <div class="spinner-border" role="status" v-show="refreshingToken">
                      <span class="visually-hidden">Loading...</span>
                    </div>                    
                  </button>
                </div>


                <div>
                  <p v-show="tokenRefreshed" class="card-text fs-4 mb-5">
                    Excellent! You can now join conversations.                  
                  </p>                   
                  <button v-show="hasToken && !tokenRefreshed" @click="refreshToken()" class="btn btn-secondary">
                    <span v-show="!refreshingToken">
                      <i class="bi-recycle"></i>
                      Refresh Token
                    </span>
                    <div class="spinner-border" role="status" v-show="refreshingToken">
                      <span class="visually-hidden">Loading...</span>
                    </div>                    
                  </button>
                  <button v-show="tokenRefreshed" disabled class="btn btn-info">                    
                    <i class="bi-check"></i>
                    Token Refreshed
                  </button>                  
                  <button v-show="endUserStore.endUser.accessToken!=''" @click="showToken = !showToken" class="btn btn-light ms-2">
                    <i class="bi-eye"></i>
                    View Token
                  </button>
                </div>
                <p v-show="showToken" class="mt-4 text-break">
                  <i>{{endUserStore.endUser.accessToken}}</i>
                </p>
                <p>
                  <button v-show="hasToken" @click="logout()" class="btn btn-danger float-end">
                    <i class="bi-box-arrow-left"></i>
                    Logout
                  </button>                  
                </p>
              </div>
            </div>

            <div v-show="hasToken" class="card mb-5 text-bg-warning">
              <div class="card-header fs-2">
                <b><i class="bi-life-preserver"></i> Chat Support</b>
              </div>
              <div class="card-body">   

                <button v-show="!hasSupportConversation" @click="createNewConversation()" class="btn btn-secondary btn-lg">
                  <i class="bi-life-preserver"></i>
                  Create Chat Support Session
                </button>

                <div v-if="hasSupportConversation" class="d-grid mt-5 mb-5">
                  <router-link :to="{ name: 'conversation', params: { sid: endUserStore.endUser.supportConversation } }" custom v-slot="{ navigate }">
                      <button  class="btn btn-lg btn-primary" @click="navigate">
                        <i class="bi-chat-left-dots-fill"></i>
                        Enter Chat Support
                      </button>
                  </router-link>
                </div>   

              </div>

            </div>

            <div v-show="hasToken" class="card mb-5 text-bg-light">
              <div class="card-header fs-2"><b><i class="bi-chat-left-dots-fill"></i> Chat Channels</b></div>
              <div class="card-body">   

                <p>
                  <button @click="getConversations()" class="btn btn-info float-end mb-4">
                    <i class="bi-recycle"></i>
                    Refresh Chat Channels
                  </button>                  
                </p>

                <table class="table table-striped mt-4 mb-5 fs-4">
                  <thead>
                    <tr>
                      <th class="text-center">Channel Name</th>                                
                      <th class="text-center">Date Created</th>
                      <th class="text-center">&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="c in conversationsFiltered" v-bind:key="c.sid">            
                      <td class="text-center">{{c.friendlyName}}</td>                                
                      <td class="text-center">{{formatDate(c.dateCreated)}}</td>          
                      <td class="text-center">                
                        <button class="btn btn-primary" @click="joinAndEnter(c.sid)">
                          <i class="bi-play-fill"></i>
                          Join and Enter
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table> 

              </div>

            </div>

          </div>
          
          <div class="col pt-5">
            
            <div class="text-center">
              <img class="img-fluid" style="max-width:450px;" src="https://twilio-cms-prod.s3.amazonaws.com/images/diagram-conversat.width-1200.format-webp.webpquality-75.webp" />
            </div>

          </div>
        </div>
      </div>

</template>