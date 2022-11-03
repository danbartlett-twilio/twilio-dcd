<script>
  import { ref, reactive, onMounted } from 'vue'  
  import { useSyncStore } from '../stores/syncStore'
  import { RouterLink } from 'vue-router'  
  import { useToast } from "vue-toastification";
  
  export default {
    setup() {
      
      const syncStore = useSyncStore()      
      
      const listList = reactive({ lists:[] })
  
      const isMainList = ref(true)

      const toast = useToast();

      // GET ALL SYNC LISTS FROM SYNC SERVICE
      const getListList = async () => {
        
        try {      
          let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-all?ts=${Date.now()}`;
          const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
          if (res.ok) {
            let r = await res.json();
            console.log("in getListList and r => ", r);               
            listList.lists = r;
            syncStore.twilioTableSID = listList.lists.find(l => l.uniqueName === 'TwilioTableMain').sid;
          }          
          
        } catch (e) { console.log("getListList error => ", e); }      

      }

      const createMainList = async () => {        
        
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-create?uniqueName=TwilioTableMain`;
        const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'} });            
        if (res.ok) {  
          toast.success("Success! TwilioTableMain created. Waiting 5 seconds before updating...");      
          setTimeout(async function(){          
            await getListList();  
            isMainList.value = true;          
          }, 5000);                    
        }  
      }

      onMounted(async () => {        
        await getListList();
        if (syncStore.twilioTableSID === null) {
          isMainList.value = false;
        }
      })

      return {
        
        syncStore, listList, createMainList, isMainList
        
      }
    }
  }

</script>

<template>
  <div class="container-fluid pt-3">
    <div class="card">
      <div class="card-header">
        <h3>Sync Lists</h3>        
      </div>
      
      <div class="card-body" v-show="isMainList">

        <p class="fs-5">
          This page contains all of the Sync Lists in your Sync Service.
        </p>

        <div class="alert alert-info text-center" v-show="listList.lists.length === 1">
          Click on <b>New Sync List</b> above to add a new list!
        </div>

        <table class="table table-striped align-middle">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">SID</th>
              <th scope="col"></th>
              <th class="text-center" scope="col">Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in listList.lists" v-bind:key="l.sid" v-show="l.uniqueName !== 'TwilioTableMain'">
              <td><router-link :to="{name:'list', params: {id: l.sid } }">{{ l.uniqueName }}</router-link></td>
              <td>
                {{ l.sid }}
              </td>  
              <td class="text-center">
                <router-link :to="{name:'list', params: {id: l.sid } }" class="btn btn-success me-2"><i class="bi-eye"></i></router-link>
                <router-link :to="{name:'listEdit', params: {id: l.sid } }" class="btn btn-warning"><i class="bi-pencil"></i></router-link>
              </td>                  
              <td class="text-center">{{ l.dateCreated }}</td>
            </tr>
          </tbody>
        </table>
      
      </div>
      <div class="card-body" v-show="!isMainList">
        <div class="alert alert-danger mb-4">
          <p class="fw-bolder">You need to add "TwilioTableMain" to your sync service!</p>
          <p>
            TwilioTable uses a list to store meta data about all of the tables (Sync Lists)
            that you create. You must create this Sync List to continue.
            Click on the button below to create a Twilio Sync List called
            "TwilioTableMain".  
          </p>
        </div>

        <div class="d-grid">
          <button @click="createMainList()" class="btn btn-success btn-lg">Create "TwilioTableMain"</button>
        </div>                

      </div>
    </div>

  </div>
</template>

<style scoped>
</style>
