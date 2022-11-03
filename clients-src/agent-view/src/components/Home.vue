<script setup>  
  import { onBeforeMount } from 'vue'
  import { RouterLink } from 'vue-router'
  import { useListStore } from '../stores/listStore' 
  import { useAgentStore } from '../stores/agentStore' 

  const listStore = useListStore();  
  const agentStore = useAgentStore();  

  onBeforeMount(async () => {
    if (listStore.lists.length === 0) {
        await listStore.getAllSyncLists();
        console.log("lists => ", listStore.lists);
    }
  })

</script>

<template>
  <div class="container-fluid">

    <div class="row">
      <div class="col pt-5">
        
        <h2>Twilio Conversations</h2>
        <p class="mt-5 fs-3">
          <b>A single API for seamless conversational messaging</b><br />
          Integrate once and extend across customers’ preferred channels to support scalable, multiparty conversations.          
        </p>     
        <p class="lead fs-3 mb-5">          
          This demo gives demonstrates an agent or administrator view into 
          an multi channel communication tool powered by Twilio Conversations.
        </p>

        <div class="text-center mt-5">
          <router-link v-if="agentStore.agent.identity != null" class="btn btn-lg btn-primary" to="/conversations">
            <i class="bi-chat-left-dots-fill"></i> Conversations
          </router-link>
          <router-link v-if="agentStore.agent.identity === null" class="btn btn-lg btn-warning" to="/login">
            <i class="bi-box-arrow-in-right"></i> Login
          </router-link>
        </div>
      </div>
      <div class="col">
        <div class="text-center pt-5 pb-5">
          <img class="img-fluid" style="max-width:600px;" src="https://twilio-cms-prod.s3.amazonaws.com/images/diagram-conversat.width-1200.format-webp.webpquality-75.webp" />
        </div>
      </div>

    </div>      

  </div>
</template>