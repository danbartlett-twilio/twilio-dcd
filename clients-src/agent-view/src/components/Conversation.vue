<script setup>
  import { ref, reactive, onMounted, toRaw } from 'vue'
  import { useRoute, useRouter } from 'vue-router'  
  import { useListStore } from '../stores/listStore'
  import { useAgentStore } from '../stores/agentStore'  
  import { useWebhookStore } from '../stores/webhookStore'
  import { useChatButtonStore } from '../stores/chatButtonStore'  
  import { formatAuthor } from '../composables/formatAuthor.js'
  import { returnPartipantAttributes } from '../composables/returnParAttributes.js'

  import { Client } from '@twilio/conversations';  

  import Message from './Message.vue'

  const listStore = useListStore();  
  const agentStore = useAgentStore();          
  const webhookStore = useWebhookStore();          
  const chatButtonStore = useChatButtonStore();          
  
  const route = useRoute();
  const router = useRouter();
  const conversationId = (route.params.sid) ? route.params.sid : 'Not Found';
  
  const addName = ref(false);
  const newConversationName = ref("");
  const participants = ref([]);
  const messages = ref([]);
  const conversationDetails = reactive({details:{}});
  const inConversation = ref(false);
  const isConnected = ref(false);
  const webhooks = ref([]);

  const newChatMessage = ref("");
  
  const currentAgentSid = ref("");
  const addWH = ref(false);
  const addWHObj  = ref({});   

  const deleteConversation = async () => {
    
    try {                
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-delete`;
      const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": {conversationSid: conversationId}}) });
      if (res.ok) {          
          console.log("Success! Conversation deleted...");
          //console.log("delete conversation response ==> ", res);        
          router.replace( { name: 'conversations' })
      }             
      
    } catch (e) { console.log("deleteConversations error => ", e); }      

  }

  const changeConversationName = async () => {
    
    try {                
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-change-name`;
      const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload":  {conversationSid: conversationId, friendlyName:newConversationName.value}}) });
      if (res.ok) {          
          //console.log("Success! Conversation name changed...");
          addName.value = false;
          newConversationName.value = "";
          getConversationResources();                
      }             
      
    } catch (e) { console.log("changeConversationName error => ", e); }      

  }        

  const removeFromConversation = async (sid) => {
    
    try {                
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-delete-participant`;
      const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": {conversationSid: conversationId, participant: sid} }) });
      if (res.ok) {          
        console.log("Success! Agent Removed from Conversation...");                
        inConversation.value = false;  
        let conversationsClient = null;
        let twilioConversation = null;
        getConversationResources();                
      }             
      
    } catch (e) { console.log("removeFromConversation error => ", e); }      

  }

  const removeMessage = async (sid) => {
    
    try {                
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-delete-message`;
      const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": {conversationSid: conversationId, messageSid: sid} }) });
      if (res.ok) {          
        console.log("Success! Message Removed from Conversation...");
        await getConversationMessages();
      }             
      
    } catch (e) { console.log("removeFromConversation error => ", e); }      

  }
  
  const addAgent = ref(false);
  const addAgentName = ref("");    
  const addAgentToConversation = async (agentId) => {
    
    try {                
      let attributes = returnPartipantAttributes('chat','agent', agentId);
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-add-participant`;
      const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": {conversationSid: conversationId, identity:agentId, attributes:attributes} }) });
      if (res.ok) {          
        console.log("Success! Added Agent to conversation...");                
        addAgentName.value = '';
        addAgent.value = false;
        getConversationResources();                
      } else {
        console.log("Error! Unable to add Agent to conversation...");                
      }             
      
    } catch (e) { console.log("addAgentToConversation error => ", e); }      

  } 

  const addWebhookToConversation = async () => {
    
    try {                
      
      //console.log("addWHObj.value => ", addWHObj.value);
      
      let createObject = { configuration:{} };
      if (addWHObj.value.target != undefined) {createObject.target = addWHObj.value.target;}
      if (addWHObj.value.flowSid != undefined) {createObject.configuration.flowSid = addWHObj.value.flowSid;}
      if (addWHObj.value.replayAfter != undefined) {createObject.configuration.replayAfter = addWHObj.value.replayAfter;}
      if (addWHObj.value.method != undefined) {createObject.configuration.method = addWHObj.value.method;}
      if (addWHObj.value.filters != undefined) {createObject.configuration.filters = addWHObj.value.filters;}
      if (addWHObj.value.url != undefined) {createObject.configuration.url = addWHObj.value.url;}

      //console.log("createObject => ", createObject);

      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-add-webhook`;
      const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": {conversationSid: conversationId, createObject:createObject} }) });
      if (res.ok) {          
        console.log("Success! Added Webhook to conversation...");                
        addWHObj.value = {};
        addWH.value = false;
        getConversationResources();                
      } else {
        console.log("Error! Unable to add Webhook to conversation...");                
      }             
      
    } catch (e) { console.log("addWebhookToConversation error => ", e); }      

  } 

  const removeWebhookFromConversation = async (webhookSid) => {
    
    try {                
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-delete-webhook`;
      const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": {conversationSid: conversationId, webhook: webhookSid} }) });
      if (res.ok) {          
        console.log("Success! Webhook Agent Removed from Conversation...");                
        inConversation.value = false;  
        let conversationsClient = null;
        let twilioConversation = null;
        getConversationResources();                
      }             
      
    } catch (e) { console.log("removeFromConversation error => ", e); }      

  }

  const addMobile = ref(false);  
  const addMobileNumber = ref("");   
  const addMobileError = ref(false);
  const addMobileErrorMsg = ref("");

  const addMobileToConversation = async (userType,displayName) => {
    
    try {                
      addMobileError.value = false;
      let attributes = returnPartipantAttributes('sms',userType, displayName);
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-add-mobile-phone-participant`;
      const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": { conversationSid: conversationId, mobile_number:addMobileNumber.value, attributes:attributes } }) });
      if (res.ok) {          
        console.log("Success! Added Mobile to conversation...");                
        addMobileNumber.value = '';
        addMobile.value = false;        
        getConversationResources();                
      } else {
        console.log("Error! Unable to add Mobile to conversation...");                
        addMobileError.value = true;
        addMobileErrorMsg.value = "We are not able to add that phone number.";
        if (res.status == 409) {
          addMobileErrorMsg.value = "That phone number is in use in a different conversation.";
        }
        addMobile.value = false;        
        addMobileNumber.value = ""; 
      }
      
    } catch (e) { console.log("addMobileToConversation error => ", e); }      

  }         

  const addAgentMobile = ref(false);
  const addAgentMobileNumber = ref("");   
  const addAgentMobileError = ref(false);
  const addAgentMobileErrorMsg = ref("");

  const addAgentMobileToConversation = async (userType,displayName) => {
    
    try {                
      addAgentMobileError.value = false;
      let attributes = returnPartipantAttributes('sms',userType, displayName);
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-add-mobile-phone-participant`;
      const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": { conversationSid: conversationId, mobile_number:addAgentMobileNumber.value, attributes:attributes } }) });
      if (res.ok) {          
        console.log("Success! Added Agent Mobile to conversation...");                
        addAgentMobileNumber.value = '';
        addAgentMobile.value = false;
        getConversationResources();                
      } else {
        console.log("Error! Unable to add Agent Mobile to conversation...");                
        addAgentMobileError.value = true;
        addAgentMobileErrorMsg.value = "We are not able to add that phone number.";
        if (res.status == 409) {
          addAgentMobileErrorMsg.value = "That phone number is in use in a different conversation.";
        }        
        addAgentMobile.value = false;
        addAgentMobileNumber.value = ""; 

      }
      
    } catch (e) { console.log("addAgentMobileToConversation error => ", e); }      

  }    

  const addWhatsApp = ref(false);
  const addWhatsAppNumber = ref(""); 
  const addWhatsAppError = ref(false);
  const addWhatsAppErrorMsg = ref("");

  const addWhatsAppToConversation = async (userType,displayName) => {
    
    try {                
      addWhatsAppError.value = false;
      let attributes = returnPartipantAttributes('whatsapp',userType, displayName);
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-add-mobile-phone-participant`;
      const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": { conversationSid: conversationId, mobile_number:addWhatsAppNumber.value, attributes:attributes } }) });
      if (res.ok) {          
        console.log("Success! Added WhatsApp to conversation...");                
        addWhatsAppNumber.value = '';
        addWhatsApp.value = false;        
        getConversationResources();                
      } else {
        console.log("Error! Unable to add WhatsApp to conversation...");                
        addWhatsAppError.value = true;
        addWhatsAppErrorMsg.value = "We are not able to add that WhatsApp phone number.";
        if (res.status == 409) {
          addWhatsAppErrorMsg.value = "That WhatsApp phone number is in use in a different conversation.";
        }
        addWhatsApp.value = false;        
        addWhatsAppNumber.value = ""; 

      }
      
    } catch (e) { console.log("addWhatsAppToConversation error => ", e); }      

  }    

  const getConversationDetails = async () => {
    
    try {                
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-details?sid=${conversationId}`;
      const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
      if (res.ok) {
        let r = await res.json();
        //console.log("in getConversationDetails and r => ", r);
        conversationDetails.details = r;
      }
      
    } catch (e) { console.log("getConversationDetails error => ", e); }      

  }

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

            if (Object.keys(participants.value[i].attributes).length === 0 && participants.value[i].messagingBinding.address !== undefined) {
              participants.value[i].attributes = JSON.parse(returnPartipantAttributes('sms','enduser', participants.value[i].messagingBinding.address));              
            }

            participantAttributeHash.value[participants.value[i].sid] = participants.value[i].attributes;
            
            if (participants.value[i].identity === agentStore.agent.identity) {
              //console.log("found current agent ==> ", participants.value[i].identity);
              currentAgentSid.value = participants.value[i].sid;
              inConversation.value = true;
            }
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
          //console.log("Message Attributes! ==> ", messages.value[i].attributes);
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

  const getConversationWebhooks = async () => {
    
    try {                
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-webhooks?sid=${conversationId}`;
      const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
      if (res.ok) {
        let r = await res.json();
        //console.log("getConversationWebhooks response ==> ", r);        
        webhooks.value = r;
        for(let i=0;i<webhooks.value.length;i++) {          
          // Pull the Name if the Webhook from Sync List
          webhooks.value[i].Name = webhookStore.webhooks.find(wh => wh.data.flowSid === webhooks.value[i].configuration.flow_sid).data.Name;
        }
      }
      
    } catch (e) { console.log("getConversationWebhooks error => ", e); }      

  }    
  
  const getConversationResources = async () => {                
      await getConversationDetails();
      await getConversationParticipants();
      await getConversationMessages();
      await getConversationWebhooks();
  }

  let conversationsClient = null;
  let twilioConversation = null;
  
  const conversationsReady = ref(true);
  const statusString = ref("");
  const clientStatus = ref("");

  const connectToConversation = async () => {        
    conversationsClient = await new Client(agentStore.agent.accessToken);
    //conversationsClient = await Client.create(agentStore.agent.accessToken);
    //console.log("conversationsClient => ", conversationsClient);
    //console.log("in connectToConversation and conversationsClient => ", conversationsClient);

    twilioConversation = await conversationsClient.getConversationBySid(conversationId);
    
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

    twilioConversation.on('tokenExpired', obj => {
       console.log("Token Expired!");
    });
      
  }


  const refreshToken = async () => {
    console.log("in refreshToken...");
    await agentStore.getToken();    
    await connectToConversation();
  };       

  const prependName = ref(true);

  const sendMessage = async () => {                           
    try {   
      let m = newChatMessage.value;
      newChatMessage.value = '...';
      if(prependName.value) {
        m = agentStore.agent.identity + ': ' + m; 
      }      
      let attributes = {
        mType: 'agentChat',
        agentMessage: true,
        agentIdentity: agentStore.agent.identity        
      }
      await twilioConversation.prepareMessage().setBody(m).setAttributes(attributes).build().send();      
      newChatMessage.value = '';
      console.log("Sent Message...");
    } catch (e) {       
      isConnected.value = false;
      console.log("sendMessage error => ", e); 
    }          
  }

  const sendImage = ref(false);
  const file = ref(null)

  const handleFileUpload = async() => {

    let attributes = {
        mType: 'agentChat',
        agentMessage: true,
        agentIdentity: agentStore.agent.identity        
      }

    const sendMediaOptions = {
      contentType: file.value.files[0].type,
      filename: file.value.files[0].name,
      media: file.value.files[0]
    };

    await twilioConversation.prepareMessage().setAttributes(attributes).addMedia(sendMediaOptions).build().send();
    sendImage.value = false;
    file.value = null;

  }

  const showInjectChat = ref(false);
  const chatButton = ref({});  
  const injectChatButton = async() => {
    try {
      let options = [];
      let co = chatButton.value.Options.split(/\#/);
      for (let i=0;i<co.length;i++) {
        let o = co[i].split(/\|/);
        let opt = {
          label:o[0],
          value:o[1],
          style:o[2]
        };
        options.push(opt);
      }      
      let attributes = {
        mType: 'chatButton',
        id: chatButton.value.Id,
        question: chatButton.value.Question,
        options: options
      }
      await twilioConversation.prepareMessage().setBody("<Chat Button>").setAttributes(attributes).build().send();              
      console.log("Injected Chat Button...");
    } catch (e) {       
      isConnected.value = false;
      console.log("injectChatButton error => ", e); 
    }       

  }

  onMounted(() => {

    getConversationResources();
    
  });

</script>

<template>
    <div class="container">            
    
      <div class="row row-height mt-2" >
        <div class="col-3">
          <div class="alert alert-primary">
            <button v-show="!addName" type="button" class="btn btn-sm btn-link float-end" @click="addName = true"><i class="bi-pencil"></i></button>
            <div v-show="addName" class="input-group">
              <input type="text" v-model="newConversationName" class="form-control">
              <button type="button" class="btn btn-sm btn-success" @click="changeConversationName()"><i class="bi-pencil"></i></button>          
            </div>     
            <h4 v-show="!addName" v-if="conversationDetails.details.friendlyName !== null" class="alert-heading">{{conversationDetails.details.friendlyName}}</h4>
            <h5 v-show="!addName" v-if="conversationDetails.details.friendlyName === null" class="alert-heading"><span class="fst-italic">no name...</span></h5>
          
          </div>
        
          <div v-if="!inConversation">
            <div class="alert alert-info text-center">
              <h5 class="alert-heading">Not in Conversation</h5>
              <p>You are not a participant in this conversation</p>
              <hr />
              <button type="button" class="btn btn-sm btn-info" @click="addAgentToConversation(agentStore.agent.identity)"><i class="bi-person-plus"></i> Join</button>  
            </div>
          </div>          

          <ul class="list-group mb-3">
            <li class="list-group-item list-group-item-secondary">Chat Agents <i class="bi-people"></i></li>
            <li v-show="p.identity != null && p.attributes.chat && p.attributes.agent" class="list-group-item" v-for="p in participants" v-bind:key="p.sid">
                {{p.identity}}
                &nbsp;
                <button type="button" class="btn btn-sm btn-warning float-end" @click="removeFromConversation(p.sid)"><i class="bi-trash"></i></button>  
            </li>
            <li class="list-group-item"> 
              <span v-show="!addAgent">Add Agent</span>
              <button v-show="!addAgent" type="button" class="btn btn-sm btn-success float-end" @click="addAgent = true"><i class="bi-person-plus"></i></button>
              <div v-show="addAgent" class="input-group">                
                <select class="form-select" v-model="addAgentName">
                  <option v-for="a in agentStore.agents" :key="a" :value="a" >{{ a }}</option>
                </select>                
                <button type="button" class="btn btn-sm btn-success" @click="addAgentToConversation(addAgentName)"><i class="bi-person-plus"></i> Add</button>          
              </div>                   
            </li>            
          </ul>
          <ul class="list-group mb-3">
            <li class="list-group-item list-group-item-secondary">Agent SMS <i class="bi-phone"></i></li>
            <li v-show="p.messagingBinding != null && p.attributes.agent" class="list-group-item" v-for="p in participants" v-bind:key="p.sid">              
                {{p.messagingBinding?.address}}
                <button type="button" class="btn btn-sm btn-warning float-end" @click="removeFromConversation(p.sid)"><i class="bi-trash"></i></button>  
            </li>
            <li class="list-group-item">            
              <span v-show="!addAgentMobile">Add Agent SMS</span>
              <button v-show="!addAgentMobile" type="button" class="btn btn-sm btn-success float-end" @click="addAgentMobile = true"><i class="bi-phone"></i></button>
                <div v-show="addAgentMobile" class="input-group">
                  <input type="text" v-model="addAgentMobileNumber" class="form-control">
                  <button type="button" class="btn btn-sm btn-success" @click="addAgentMobileToConversation('agent','Agent')"><i class="bi-phone"></i> Add</button>
                </div>  
                <p v-show="addAgentMobileError" class="text-danger">{{addAgentMobileErrorMsg}}</p>                  
            </li>
          </ul>          
          <ul class="list-group mb-3">
            <li class="list-group-item list-group-item-success">End User Chat <i class="bi-person-workspace"></i></li>
            <li v-show="p.identity !== null && p.attributes.chat && p.attributes.enduser" class="list-group-item" v-for="p in participants" v-bind:key="p.sid">
                {{formatAuthor(p.identity)}}
                &nbsp;
                <button type="button" class="btn btn-sm btn-warning float-end" @click="removeFromConversation(p.sid)"><i class="bi-trash"></i></button>  
            </li>
            <li class="list-group-item text-center"> 
              <button v-show="!showInjectChat" type="button" @click="showInjectChat = true" class="btn btn-sm btn-info">
                Inject Chat Buttons
              </button>
              <div v-show="showInjectChat" class="input-group">                
                <select class="form-select" v-model="chatButton">
                  <option v-for="cb in chatButtonStore.chatbuttons" :key="cb.data.Id" :value="cb.data" >{{ cb.data.Label }}</option>
                </select>                
                <button type="button" class="btn btn-sm btn-success" @click="injectChatButton()"><i class="bi-input-cursor"></i> Inject</button>          
                <button type="button" class="btn btn-sm btn-light" @click="showInjectChat = false"><i class="bi-x"></i></button>          
              </div>                
            </li>
          </ul>            
          <ul class="list-group mb-3">
            <li class="list-group-item list-group-item-success">End User SMS <i class="bi-phone"></i></li>
            <li v-show="p.messagingBinding != null && p.attributes.enduser" class="list-group-item" v-for="p in participants" v-bind:key="p.sid">              
                {{p.messagingBinding?.address}}
                <button type="button" class="btn btn-sm btn-warning float-end" @click="removeFromConversation(p.sid)"><i class="bi-trash"></i></button>  
            </li>
            <li class="list-group-item">            
              <span v-show="!addMobile">Add SMS Participant</span>
              <button v-show="!addMobile" type="button" class="btn btn-sm btn-success float-end" @click="addMobile = true"><i class="bi-phone"></i></button>
                <div v-show="addMobile" class="input-group">
                  <input type="text" v-model="addMobileNumber" class="form-control">
                  <button type="button" class="btn btn-sm btn-success" @click="addMobileToConversation('enduser','End User')"><i class="bi-phone"></i> Add</button>          
                </div>  
                <p v-show="addMobileError" class="text-danger">{{addMobileErrorMsg}}</p>                  
            </li>
          </ul>               
          <ul class="list-group mb-3">
            <li class="list-group-item list-group-item-success">End User WhatsApp <i class="bi-whatsapp"></i></li>
            <!--<li v-show="p.messagingBinding != null" class="list-group-item" v-for="p in participants" v-bind:key="p.sid">              
                {{p.messagingBinding?.address}}
                <button type="button" class="btn btn-sm btn-warning float-end" @click="removeFromConversation(p.sid)"><i class="bi-trash"></i></button>  
            </li>-->
            <li class="list-group-item">            
              <span v-show="!addWhatsApp">Add WhatsApp Participant</span>
              <button v-show="!addWhatsApp" type="button" class="btn btn-sm btn-success float-end" @click="addWhatsApp = true"><i class="bi-whatsapp"></i></button>
                <div v-show="addWhatsApp" class="input-group">
                  <input type="text" v-model="addWhatsAppNumber" class="form-control">
                  <button type="button" class="btn btn-sm btn-success" @click="addWhatsAppToConversation('enduser','End User')"><i class="bi-whatsapp"></i> Add</button>          
                </div>  
                <p v-show="addWhatsAppError" class="text-danger">{{addWhatsAppErrorMsg}}</p>                  
            </li>
          </ul>                    
          <ul class="list-group mb-3">
            <li class="list-group-item list-group-item-warning">Webhooks <i class="bi-robot"></i></li>
            <li class="list-group-item" v-for="w in webhooks" v-bind:key="w.sid">              
                {{w.Name}}
                <button type="button" class="btn btn-sm btn-warning float-end" @click="removeWebhookFromConversation(w.sid)"><i class="bi-trash"></i></button>  
            </li>
            <li class="list-group-item">            
              <span v-show="!addWH">Add Webhook</span>
              <button v-show="!addWH" type="button" class="btn btn-sm btn-success float-end" @click="addWH = true"><i class="bi-robot"></i></button>
              <div v-show="addWH" class="input-group">                
                <select class="form-select" v-model="addWHObj">
                  <option v-for="wh in webhookStore.webhooks" :key="wh.index" :value="wh.data" >{{ wh.data.Name }}</option>
                </select>                
                <button type="button" class="btn btn-sm btn-success" @click="addWebhookToConversation()"><i class="bi-robot"></i> Add</button>          
              </div>                     
            </li>
          </ul>                    
          <div class="alert alert-info text-center">
              <button type="button" class="btn btn-sm btn-danger" @click="deleteConversation()"><i class="bi-trash"></i> Delete Conversation</button>  
            </div>             
        </div>

        <div class="col-9 pb-5">

          <div v-if="inConversation">
            <div v-if="!isConnected" class="alert alert-danger">
              <button type="button" class="btn btn-sm btn-danger float-end" @click="connectToConversation()"><i class="bi-plug"></i> Connect</button>                
              <h5 class="alert-heading">Not Connected</h5>
              <p>You are not connected to this conversation!</p> 
              <p>
                Trouble connecting?
                <router-link to="/agent">Refresh Token</router-link>
              </p>                                            
            </div>            
            <div v-if="isConnected" class="alert alert-success">                
                <form v-on:submit.prevent="submitForm">
                  <div class="form-check">
                    <input v-model="prependName" class="form-check-input" type="checkbox" id="flexCheckDefault">
                    <label class="form-check-label" for="flexCheckDefault">
                      <em>Prepend Your Name</em>
                    </label>
                  </div>                  
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
          <div class="bg-info rounded" style="min-height:200px;">
            <div ref="messagesDiv" class="container-fluid pt-3 pb-3">
              <message @removeMessage="(sid) => removeMessage(sid)" v-for="m in messages" v-bind:participant="m.participantAttributes" v-bind:mAttributes="m.attributes" v-bind:key="m.sid" v-bind:mSid="m.sid" v-bind:pSid="m.participantSid" v-bind:dateCreated="m.dateCreated" v-bind:author="m.author" v-bind:content="m.body" v-bind:media="m.media" v-bind:cSid="conversationDetails.details.sid"></message>
            </div>
         </div>
         <p class="float-end"><em>{{conversationDetails.details.sid}}</em></p>
        </div>
      </div>

    </div>
</template>

<style scoped>
  </style>