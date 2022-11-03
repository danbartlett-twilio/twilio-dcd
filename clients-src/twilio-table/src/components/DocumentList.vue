<script>
  import { ref, reactive, onMounted } from 'vue'  
  import { useSyncStore } from '../stores/syncStore'
  import { RouterLink } from 'vue-router'  
  import { useToast } from "vue-toastification";
  
  export default {
    setup() {
      
      const syncStore = useSyncStore()      
      
      const documentList = reactive({ documents:[] })
  
      const isMainList = ref(true)

      const toast = useToast();

      // GET ALL SYNC DOCUMENTS FROM SYNC SERVICE
      const getDocumentList = async () => {
        
        documentList.documents = [];

        try {      
          let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/document-all?ts=${Date.now()}`;
          const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
          if (res.ok) {
            let r = await res.json();
            console.log("in getDocumentList and r => ", r);               
            documentList.documents = r;
          }          
          
        } catch (e) { console.log("getListList error => ", e); }      

      }

      const syncDeleteDocName = ref("")
      const syncDeleteDocSid = ref("")
      function confirmDeleteDocument(n,s) {
        syncDeleteDocName.value = n;
        syncDeleteDocSid.value = s;
      }
      const deleteDocument = async() => {

        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/document-delete`;
        const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"documentSid": syncDeleteDocSid.value}) });
        if (res.ok) {
          syncDeleteDocName.value = "";
          syncDeleteDocSid.value = "";
          setTimeout(function(){                      
            toast.success("Success! Document deleted!");
          }, 1000);
            setTimeout(function(){          
              toast.warning("Updating...");
            }, 2000);            
            setTimeout(function(){          
              getDocumentList();
            }, 4000);              
        }

      }  

      onMounted(async () => {        
        await getDocumentList();
      })

      return {
        
        documentList, confirmDeleteDocument, syncDeleteDocName, syncDeleteDocSid, deleteDocument 
        
      }
    }
  }

</script>

<template>
  <div class="container-fluid pt-3">
    <div class="card">
      <div class="card-header">
        <h3>Document List</h3>        
      </div>
      
      <div class="card-body">

        <p class="fs-5">
          This page contains all of the Sync Documents in your Sync Service.
        </p>

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
            <tr v-for="d in documentList.documents" v-bind:key="d.sid">
              <td><router-link :to="{name:'document', params: {id: d.sid } }">{{ d.uniqueName }}</router-link></td>
              <td>
                {{ d.sid }}
              </td>  
              <td class="text-center">
                <router-link :to="{name:'document', params: {id: d.sid } }" class="btn btn-success me-2"><i class="bi-eye"></i></router-link>
                <router-link :to="{name:'listEdit', params: {id: d.sid } }" class="btn btn-warning  me-2"><i class="bi-pencil"></i></router-link>
                <button @click="confirmDeleteDocument(d.uniqueName,d.sid)" type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal"><i class="bi-trash"></i></button>
              </td>                  
              <td class="text-center">{{ d.dateCreated }}</td>
            </tr>
          </tbody>
        </table>
      
      </div>
    </div>

    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Are you sure?</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Delete the Sync Document {{syncDeleteDocName}}? Cannot undo!</p>            
          </div>
          <div class="modal-footer">
            <button @click="deleteDocument()" type="button" class="btn btn-danger" data-bs-dismiss="modal">YES, DELETE</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
</style>
