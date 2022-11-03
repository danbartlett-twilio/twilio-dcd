<script setup>  
  import { ref, onMounted } from 'vue'
  import { useRouter, RouterLink } from 'vue-router'
  import { useListStore } from '../stores/listStore' 
  import { useAgentStore } from '../stores/agentStore'  
  import { useWebhookStore } from '../stores/webhookStore'  
  
  const listStore = useListStore() 
  const webhookStore = useWebhookStore();    
  const agentStore = useAgentStore();    

  const router = useRouter();

  const agentObj = listStore.lists.find(o => o.uniqueName === 'AgentList');

  const createAgent = ref("");        
  const selectedAgent = ref("");

  const createAccount = async () => {

    console.log("in createAccount...")     

    let a = {
      "Identity":createAgent.value
    };

    let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-create?targetList=${agentObj.sid}`;
    const na = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": a}) });
    if (na.ok) {
      await na.json();        
      agentStore.agent.identity = createAgent.value        
      await agentStore.getToken();      
      moveToNextPage();
    } else {
      return false
    }

  }

  const loginAgent = async () => {
    agentStore.agent.identity = selectedAgent.value        
    await agentStore.getToken();      
    moveToNextPage();
  }

  function  moveToNextPage() {
    router.replace( { name: 'conversations' })  
  }

  onMounted(async () => {
    
    await agentStore.getAgents();  
    await webhookStore.getWebhooks();        

  })

</script>

<template>
  <div class="container-fluid pt-5 pb-5">

    <div class="alert alert-success text-center fw-bold mb-5" v-show="agentStore.agent.identity !== null">
        You are logged in as {{agentStore.agent.identity}}
        <router-link class="btn btn-sm btn-primary" to="/">
          <i class="bi-house"></i> Home
        </router-link>
        <router-link class="btn btn-sm btn-primary ms-2" to="/conversations">
          <i class="bi-chat-left-dots-fill"></i> Conversations
        </router-link>
        <router-link class="btn btn-sm btn-primary ms-2" to="/agent">
          <i class="bi-person"></i> Agent
        </router-link>          
    </div>

    <div v-show="agentStore.agent.identity === null">
      <div class="d-flex justify-content-center mt-3 mb-5">
        <div>
        <ul class="nav nav-pills mb-3" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="login-tab" data-bs-toggle="tab" data-bs-target="#login" type="button" role="tab" aria-controls="login" aria-selected="false">Existing Agent Login</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="create-tab" data-bs-toggle="tab" data-bs-target="#create" type="button" role="tab" aria-controls="create" aria-selected="true">Create Agent</button>
          </li>
        </ul>
        <div class="tab-content">
          <div class="tab-pane" id="create" role="tabpanel" aria-labelledby="create-tab">        
            <div class="card p-5" style="width: 36rem;">
              <div class="mb-3">
                <label for="exampleFormControlInput1" class="form-label">Agent</label>
                <input type="text" v-model="createAgent" class="form-control" id="exampleFormControlInput1" placeholder="">
              </div>
                <div class="d-grid">
                  <button @click="createAccount()" class="btn btn-primary btn-lg">
                    <i class="bi-person-plus"></i>
                    Create Agent
                  </button>
                </div> 
            </div>   
          </div>
          <div class="tab-pane active" id="login" role="tabpanel" aria-labelledby="login-tab">
            <div class="card p-5" style="width: 36rem;">
              <div class="mb-3">
                <label for="exampleFormControlInput1" class="form-label">Agent</label>
                <select class="form-select" v-model="selectedAgent">
                  <option v-for="a in agentStore.agents" :key="a" :value="a" >{{ a }}</option>
                </select>
              </div>
              <div class="d-grid">
                  <button @click="loginAgent()" class="btn btn-success btn-lg">
                      <i class="bi-box-arrow-in-right"></i>
                      Login
                  </button>
              </div>             
            </div>

          </div>
        </div>
        </div>
      </div> 
    </div>




  </div>
</template>

<style scoped>
</style>
