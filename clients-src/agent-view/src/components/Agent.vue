<script setup>  
  import { ref, computed } from 'vue'
  import { RouterLink } from 'vue-router'
  import { useAgentStore } from '../stores/agentStore' 

  const agentStore = useAgentStore();

  const tokenSet = computed(() => {
    return (agentStore.agent.accessToken != '') ? true : false; 
  });
  
  const showToken = ref(false);    
  const refreshingToken = ref(false);    
  const tokenRefreshed = ref(false);   
  
  const callGetToken = async () => {            
    refreshingToken.value = true;
    await agentStore.getToken();
    refreshingToken.value = false;
    tokenRefreshed.value = true;    
  };

  function logout() {
    agentStore.$reset();
    showToken.value = false;    
    refreshingToken.value = false;    
    tokenRefreshed.value = false;   
  }

</script>

<template>
    <div class="container-fluid">

      <div class="card text-dark bg-light mt-5 mb-5" >
        <div class="card-header fs-4">
          <i class="bi-person-workspace me-2"></i>
          <b>Agent</b>
        </div>
        <div class="card-body">                
          <h5 class="card-title fs-2 mb-5">
            <b>
              {{agentStore.agent.identity}}
            </b>
          </h5>  
          <p class="card-text fs-5 mb-5">
            In order order to enter a conversation, you need a valid
            access token.                  
          </p>          
          <p class="card-text fs-5 mb-5">
            <button v-show="tokenSet && !tokenRefreshed" @click="callGetToken()" class="btn btn-primary">
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
            <button v-show="tokenSet" @click="showToken = !showToken" class="btn btn-warning ms-2">
              <i class="bi-eye"></i>
              View Token
            </button>
          </p>
          <p v-show="showToken" class="text-break mb-5 p-2 bg-warning">
            <i>{{agentStore.agent.accessToken}}</i>
          </p>
          <p>
            <button v-show="tokenSet" @click="logout()" class="btn btn-danger float-end">
              <i class="bi-box-arrow-left"></i>
              Logout
            </button>                  
          </p>
        </div>
      </div>

    </div>
  </template>
