<script setup>
  import { ref, reactive, computed, watch, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { formatDate } from '../composables/formatDate.js'    
  
  const route = useRoute();
  const conversations = ref([]);

  const getConversations = async () => {
    
    try {                
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/return-conversations`;
      const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
      if (res.ok) {
        let r = await res.json();
        console.log("in getConversations and r => ", r);
        conversations.value = r;
      }
      
    } catch (e) { console.log("getConversations error => ", e); }      

  }

  const newConversationName = ref("");
  const addConversation = ref(false);     

  const createNewConversation = async () => {

    try {                
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-create`;
      const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": {conversationName: newConversationName.value} }) });
      if (res.ok) {          
        console.log("Success! Created a new conversation...");                
        newConversationName.value = '';
        addConversation.value = false;
        getConversations();                
      } else {
        console.log("Error! Unable to create new conversation...");                
      }             
      
    } catch (e) { console.log("createNewConversation error => ", e); }  
  
  }

  const deleteConversation = async (sid) => {
    
    try {                
      let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-delete`;
      const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": {conversationSid: sid}}) });
      if (res.ok) {          
          console.log("Success! Conversation deleted...");
          getConversations();          
      }             
      
    } catch (e) { console.log("deleteConversations error => ", e); }      

  }  
  

  onMounted(() => {

    getConversations();
    
  });

</script>

<template>
    <div class="container-fluid pt-4">

      <button @click="getConversations()" class="float-end btn btn-lg btn-secondary">
        <i class="bi bi-arrow-clockwise"></i>
        Refresh
      </button>
      <h3>Conversations</h3>

      <table class="table table-striped mt-4 mb-5 fs-4">
        <thead>
          <tr>
            <th class="text-center">Friendly Name</th>          
            <th class="text-center">Chat ID</th>
            <th class="text-center">Date Created</th>
            <th class="text-center">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in conversations" v-bind:key="c.sid">            
            <td class="text-center">{{c.friendlyName}}</td>          
            <td class="text-center">{{c.sid}}</td>          
            <td class="text-center">{{formatDate(c.dateCreated)}}</td>          
            <td class="text-center">                
                <router-link :to="{ name: 'conversation', params: { sid: c.sid } }" custom v-slot="{ navigate }">
                    <button class="btn btn-primary" @click="navigate">
                      <i class="bi-play-fill"></i>
                      Enter
                    </button>
                </router-link>
                <button class="btn btn-danger ms-2" @click="deleteConversation(c.sid)">
                  <i class="bi-trash"></i>
                </button>
            </td>
          </tr>
        </tbody>
      </table> 

      <div class="row pb-5">
        <div class="col-6">
          <button v-show="!addConversation" type="button" class="btn btn-info" @click="addConversation = true">
            <i class="bi-plus-circle-fill me-1"></i>                 
            Create New Conversation
          </button>
          <div v-show="addConversation">
            <label for="" class="form-label fs-4"><b>Enter Friendly Name for New Conversation</b></label>
            <div  class="input-group">               
              <input type="text" v-model="newConversationName" class="form-control">
              <button type="button" class="btn btn-sm btn-success" @click="createNewConversation()">
                <i class="bi-plus-circle-fill me-2"></i>  Create
              </button>          
            </div>                          
          </div>
        </div>                   
      </div>
  
  </div>

</template>