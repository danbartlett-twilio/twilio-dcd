<script>
  import { ref, reactive, watch, onBeforeMount, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'  
  import { useToast } from "vue-toastification";

  
  export default {
    setup() {
      const route = useRoute();
      const documentSid = route.params.id;
      const router = useRouter();
      
      const toast = useToast();

      const doc = reactive({doc:{}});

      // GET LIST DETAILS FROM TwilioTableMain
      const getDocument = async () => {
        
        try {
          let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/document-get?documentSid=${documentSid}`;
          const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
          if (res.ok) {
            let r = await res.json();
            console.log("in getListData and r => ", r);
            doc.doc = r
          }
        } catch (e) {
          console.log("Error in getDocument => ", e)
        }
      
      }

      const updateDocument = async() => {

        savingList.value = true;

        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/document-update?documentSid=${documentSid}`;
        let payload = prettyJson.value;
        const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": payload}) });
        if (res.ok) {
          setTimeout(function(){                      
            savingList.value = false;
            jsonChanged.value = false;
            jsonParseError.value = false;
            jsonReady.value = false;            
            isNew.value = false;
            toast.success("Success! Document updated!");
          }, 2000);
            setTimeout(function(){          
              toast.warning("Redirecting...");
            }, 3000);            
            setTimeout(function(){          
              router.replace( { name: 'document', params:{id:documentSid} })
            }, 4000);              
        }

      }  

      const newDocName = ref("");
      const createDocument = async() => {

        savingList.value = true;

        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/document-create?documentName=${newDocName.value}`;
        let payload = prettyJson.value;
        const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": payload}) });
        if (res.ok) {
          let r = await res.json();
          setTimeout(function(){                      
            savingList.value = false;
            jsonChanged.value = false;
            jsonParseError.value = false;
            jsonReady.value = false;            
            isNew.value = false;
            toast.success("Success! New Document created!");
          }, 2000);
            setTimeout(function(){          
              toast.warning("Redirecting...");
            }, 3000);            
            setTimeout(function(){          
              router.replace( { name: 'document', params:{id:r.sid} })
            }, 4000);              
        }

      }  

      const prettyJson = ref("");
      function formatJson() {
        prettyJson.value = JSON.stringify(doc.doc.data, null, 4)
      }

      const isNew = ref(false)

      onBeforeMount(async () => {        
        if (route.params.id === 'new') {
          isNew.value = true
        } else {
          await getDocument();  
          formatJson();
        }

      })

      const jsonChanged = ref(false)
      const jsonParseError = ref(false)
      const jsonReady = ref(false)
      const savingList = ref(false)
      
      function parseJsonForm() {
        jsonParseError.value = false;
        jsonReady.value = false;
        try {
          let parsedJson = JSON.parse(prettyJson.value);
          console.log("parsedJson => ", parsedJson);
          jsonReady.value = true;
        } catch(e) {
          jsonParseError.value = true;
          jsonReady.value = false;
          console.log("Error in parseJsonForm => ", e);
        }
      }


      return {
        documentSid, doc, prettyJson, isNew, 
        jsonChanged, jsonParseError, jsonReady, savingList,
        parseJsonForm, updateDocument, createDocument, newDocName
      }    
  }
}

</script>

<template>

  <div class="container-fluid pt-3">
    <div class="card" :class="{'border-success': isNew, 'border-warning': !isNew }">
    
      <div class="card-header">
        <div class="row">
          <div class="col">
            <h3>
              <span v-show="isNew">Create New Document <i class="bi-file-plus"></i></span>
              <span v-show="!isNew">{{doc.doc.uniqueName}} >> <i class="bi-pencil"></i> Edit</span>
            </h3>        
          </div>
          <div class="col text-end">
              <router-link v-show="!isNew" :to="{name:'document', params: {id: documentSid } }" class="btn btn-success"><i class="bi-eye"></i></router-link>
          </div>
        </div>
      </div>
      
      <div class="card-body">
        <div v-show="!isNew">
            <h5>Edit JSON Below:</h5>
        </div> 

        <div v-show="isNew">
            <div class="mb-3">
              <label for="docname" class="form-label">Document Name</label>
              <input v-model="newDocName" type="text" class="form-control" id="docname" aria-describedby="emailHelp" placeholder="Enter Document Unique Name">              
            </div>            
            <h5>Enter New JSON Below:</h5>
        </div> 

        <textarea v-model="prettyJson" class="form-control mb-3" rows="15" @change="jsonChanged = true"></textarea>

        <div v-show="jsonParseError" class="alert alert-danger">There is an error in your JSON! Please correct and try again...</div>
        <div class="mb-3">
          <button class="btn btn-primary" @click="parseJsonForm()">Check JSON</button>              
        </div>     
        <div v-show="jsonReady" class="alert alert-success">
          <div class="spinner-border text-primary" role="status" v-show="savingList">
            <span class="visually-hidden">Saving...</span>
          </div>
          <div v-show="!savingList && !isNew">
            Your JSON checked out. <button class="btn btn-success" @click="updateDocument()">Save Sync Document JSON</button>
          </div>
          <div v-show="!savingList && isNew">
            Your JSON checked out. <button class="btn btn-success" @click="createDocument()">Save New Sync Document</button>
          </div>

        </div>           
      </div>
    
    </div>

  </div>

</template>