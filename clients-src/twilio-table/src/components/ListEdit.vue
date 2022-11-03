<script>
  import { ref, reactive, watch, onBeforeMount, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useSyncStore } from '../stores/syncStore'
  import { useToast } from "vue-toastification";
  import { useCheckMainSid } from '../composables/check-main-sid.js'  
  
  export default {
    setup() {

      const syncStore = useSyncStore()
      const toast = useToast();
      
      const route = useRoute();
      const router = useRouter();

      const columnTypes = [
        {value: 'string', label: 'String'}, 
        {value: 'integer', label: 'Integer'}, 
        {value: 'boolean', label: 'Boolean'}, 
        {value: 'currency', label: 'Currency'},
        {value: 'link', label: 'Link'},
      ];

      const jsonInput = ref("");
      const jsonParseError = ref(false);
      const jsonReady = ref(false);

      function parseJsonForm() {
        jsonParseError.value = false;
        jsonReady.value = false;
        try {
          let parsedJson = JSON.parse(jsonInput.value);
          console.log("parsedJson => ", parsedJson);
          jsonReady.value = true;
        } catch(e) {
          jsonParseError.value = true;
          jsonReady.value = false;
          console.log("Error in parseJsonForm => ",e);
        }
      }

      function createListFromJson() {
        try {
          let parsedJson = JSON.parse(jsonInput.value);
          pageObject.listName = parsedJson.listName;            
          pageObject.listDescription = parsedJson.listDescription;            
          pageObject.columns = parsedJson.columns; 
          pageObject.items = parsedJson.items;
          createList();                     
        } catch(e) {
          jsonParseError.value = true;
          jsonReady.value = false;
          console.log("Error in createListFromJson => ",e);
        }
      }


      const pageObject = reactive({ listName:null, listDescription:null, listSid:null, listItemIndex:null, columns:[], items: [], saved:true })

      function cleanListName() {
        pageObject.listName = pageObject.listName.replace(/[^A-Z0-9]/ig, "_");
        pageObject.saved = false;
      }

      function addColumn() {
        let newColumn = {
          header:null,
          columnType:'string'        
        };
        pageObject.columns.push(newColumn);
        pageObject.saved = false;
      } 

      function reorder(direction, index) {
        let p = (direction=='up') ? index-1 : index+1;
        pageObject.columns.splice(p, 0, pageObject.columns.splice(index, 1)[0]);
        pageObject.saved = false;
      }

      function removeColumn(index) {
        pageObject.columns.splice(index, 1);
        pageObject.saved = false;
      }

      const savingList = ref(false);

      const createList = async() => {

        savingList.value = true;

        // #1 Create a new list and grab the SID
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-create?uniqueName=${pageObject.listName}`;
        const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'} });
        

        if (res.ok) {
          
          toast.success("Success! New List Created... Adding Items...");
          
          let r = await res.json();          

          // #2 Change isNew and set id = new list SID
          pageObject.listSid = r.sid

          // #3 If any items, add them to new table          
          await Promise.all(pageObject.items.map(async (item) => {
            await saveNewItemObject(item)
          })).then(() => {         
            console.log("saved rows...") 
            toast.success("Success! New rows added! Updating TwiliMainTable...");
          })          


          // #4 Add a item into the TwilioTableMain for new List
          url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-create?targetList=${syncStore.twilioTableSID}`;          
          let payload = {
            listName: pageObject.listName,
            listSid: pageObject.listSid,
            listDescription: pageObject.listDescription,
            columns: pageObject.columns
          };          
          const res2 = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": payload}) });
          if (res2.ok) {
            setTimeout(function(){          
              pageObject.saved = true;
              savingList.value = false;
              toast.success("Success! New List Added!");
            }, 2000);
            setTimeout(function(){          
              toast.warning("Redirecting...");
            }, 3000);            
            setTimeout(function(){          
              router.replace( { name: 'listList' })
            }, 4000);                        
          }


        }
      
      }  

      const saveNewItemObject = async (p) => {
        console.log("in saveNewItemObject...")     
        
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-create?targetList=${pageObject.listSid}`;
        return await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": p}) });

      }

      const deleteList = ref(false);

      const deleteListFn = async() => {

        savingList.value = true;

        // #1 Delete the List
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-delete?listSid=${pageObject.listName}`;
        const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'} });
            
        if (res.ok) {

          // #2 Delete the meta item from TwilioTableMain      
              
          let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-delete?targetList=${syncStore.twilioTableSID}&listItemIndex=${pageObject.listItemIndex}`;
          const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'} });
          if (res.ok) {
            setTimeout(async function(){          
              toast.warning("Success! List deleted. Redirecting in 3 seconds...");
            }, 1000);        
            setTimeout(async function(){          
              router.replace( { name: 'listList' })
            }, 4000);                    
          }

        }
        

      }  


      const updateList = async() => {

        savingList.value = true;

        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-update?targetList=${syncStore.twilioTableSID}`;
        url += `&listItemIndex=${pageObject.listItemIndex}`
        let payload = {
          listName: pageObject.listName,
          listSid: pageObject.listSid,
          listDescription: pageObject.listDescription,
          columns: pageObject.columns
        };
        const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": payload}) });
        if (res.ok) {
          setTimeout(function(){          
            pageObject.saved = true;
            savingList.value = false;
            isNew.value = false;
            toast.success("Success! List updated!");
          }, 2000);
        }

      }  

      const getListData = async() => {
        
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${syncStore.twilioTableSID}&ts=${Date.now()}`;
        url += `&filterField=listSid&filterFieldValue=${route.params.id}`
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {Accept: "application/json", 'cache-control':'no-cache'} });
        if (!res.ok) {
          console.log("Error getting List => ")
        }
        let r = await res.json();                
        pageObject.listName = r[0].data.listName;
        pageObject.listSid = r[0].data.listSid;
        pageObject.listDescription = r[0].data.listDescription;
        pageObject.columns = r[0].data.columns;
        pageObject.listItemIndex = r[0].index;        

      }

      const isNew = ref(true)
      const isNewJson = ref(false)

      onBeforeMount(() => {
        // MAKE SURE THAT MAIN TABLE SID IS SET
        useCheckMainSid();

      })

      onMounted(() => {                
        if (route.params.id !== 'new') {
          isNew.value = false
          console.log("get list data!");
          getListData();
        }
      })

      const tableSid = ref(route.params.id);
      
      const showNewJson = ref(false)

      watch([isNew, isNewJson], (c, o) => {
        if(c[0] === true && c[1] === true) {
          showNewJson.value = true;
        } else {
          showNewJson.value = false;
        }
      });

      return {
        tableSid, pageObject, cleanListName, addColumn, reorder, removeColumn, columnTypes:columnTypes,
        updateList, createList, savingList, isNew, isNewJson, showNewJson, deleteList, deleteListFn,
        parseJsonForm, jsonInput, jsonParseError, jsonReady, createListFromJson
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
              <span v-show="isNew">Create New Table <i class="bi-file-plus"></i></span>
              <span v-show="!isNew">{{pageObject.listName}} >> <i class="bi-pencil"></i> Edit</span>
            </h3>        
          </div>
          <div class="col text-end">
              <router-link v-show="!isNew" :to="{name:'list', params: {id: tableSid } }" class="btn btn-success"><i class="bi-eye"></i></router-link>
          </div>
        </div>
      </div>

      <div class="card-body" v-show="!showNewJson">            
        
        <h4>Add a new Twilio Sync List from a Form</h4>

        <div class="mt-3 mb-3 text-end float-end" v-show="isNew">
          <button @click="isNewJson = !isNewJson" class="btn btn-light">Add from JSON</button>
        </div>

        <div class="mb-3">
          <label for="newTableName" class="form-label">List Name (no spaces / special chars)</label>
          <input :disabled="!isNew" type="text" v-model="pageObject.listName" class="form-control" id="newTableName" @change="cleanListName()">
        </div>
        <div class="mb-3">
          <label for="tableDescription" class="form-label">List Description</label>
          <textarea class="form-control" v-model="pageObject.listDescription" id="tableDescription" rows="2" @change="pageObject.saved = false;"></textarea>
        </div>

        <h3 class="mb-2">Columns</h3>

        <div class="mt-3 mb-3 text-start">
          <button @click="addColumn()" class="btn btn-primary"><i class="bi-plus-circle-fill"></i> Add Column</button>
        </div>
        
        <div>
          
          <div class="mb-3" v-for="c,i in pageObject.columns" v-bind:key="c.dscr">
            <div class="row">
              <div class="col-sm-1">
                <span class="badge bg-secondary">{{i+1}}</span>
              </div>
              <div class="col-sm-4">
                <input type="text" class="form-control" v-model="c.header" placeholder="Column Name" @change="pageObject.saved = false;" >
              </div>
              <div class="col-sm-4">
                <select class="form-select" v-model="c.columnType" @change="pageObject.saved = false;">              
                  <option v-for="ct in columnTypes" :key="ct.value" :value="ct.value" :selected="ct.value==c.columnType" >{{ ct.label }}</option>
                </select>
              </div>
              <div class="col-sm-3 text-end">
                <button v-show="i!==0" @click="reorder('up',i)" class="btn btn-sm btn-success me-1"><i class="bi-arrow-up-circle-fill"></i></button>
                <button v-show="i!==(pageObject.columns.length-1)" @click="reorder('down',i)" class="btn btn-sm btn-warning me-1"><i class="bi-arrow-down-circle-fill"></i></button>
                <button @click="removeColumn(i)" class="btn btn-sm btn-danger me-1"><i class="bi-trash"></i></button>
              </div>        
            </div>
          </div>    

        </div>    

        <div v-show="!pageObject.saved">
          <div class="mt-4 alert alert-danger text-center" v-show="!isNew">
              <div class="spinner-border text-primary" role="status" v-show="savingList">
                <span class="visually-hidden">Loading...</span>
              </div>
              <button @click="updateList()" class="btn btn-danger" v-show="!savingList"><i class="bi-save"></i> Save Changes</button>
          </div>
          <div class="mt-4 alert alert-success text-center" v-show="isNew">
              <div class="spinner-border text-primary" role="status" v-show="savingList">
                <span class="visually-hidden">Loading...</span>
              </div>
              <button @click="createList()" class="btn btn-success" v-show="!savingList"><i class="bi-save"></i> Save New List</button>
          </div>
        </div>

        <p v-show="!deleteList" class="text-end mt-4">
          <button @click="deleteList = !deleteList" type="button" class="btn btn-link"><span class="fst-italic">Need to delete this List?</span></button>
        </p>
        <div v-show="deleteList" class="mt-4 alert alert-danger text-center">
          Are you sure? <button @click="deleteListFn()" class="btn btn-danger me-2">Delete List</button>
          <button @click="deleteList = !deleteList" class="btn btn-light">Cancel</button>
        </div>

      </div>
        
      <div class="card-body" v-show="showNewJson">
      
        <div class="mt-3 mb-3 text-end float-end" v-show="isNew">
          <button @click="isNewJson = !isNewJson" class="btn btn-light">Add from Form</button>
        </div>

        <h4>Add a new Twilio Sync List from JSON</h4>

        <p class="lead">
          Enter JSON in the textarea below to create a new form. The JSON can optionially
          include rows of data.
        </p>
        <ul class="nav nav-tabs mb-3" id="pills-tab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="pills-json-tab" data-bs-toggle="pill" data-bs-target="#pills-json" type="button" role="tab" aria-controls="pills-json" aria-selected="true">JSON Input</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="pills-json-tab" data-bs-toggle="pill" data-bs-target="#pills-json-sample" type="button" role="tab" aria-controls="pills-json-sample" aria-selected="false">Sample JSON</button>
          </li> 
        </ul>
        <div class="tab-content" id="pills-tabContent">
          <div class="tab-pane fade show active" id="pills-json" role="tabpanel" aria-labelledby="pills-json-tab" tabindex="0">
            <div class="mb-3">
              <label for="jsonInput" class="form-label">Paste / Enter JSON below...</label>
              <textarea v-model="jsonInput" class="form-control" id="jsonInput" rows="10"></textarea>
            </div>  
            <div v-show="jsonParseError" class="alert alert-danger">There is an error in your JSON! Please correct and try again...</div>
            <div class="mb-3">
              <button class="btn btn-primary" @click="parseJsonForm()">Check JSON</button>              
            </div>     
            <div v-show="jsonReady" class="alert alert-success">
              <div class="spinner-border text-primary" role="status" v-show="savingList">
                <span class="visually-hidden">Saving...</span>
              </div>
              <div v-show="!savingList">
                Your JSON checked out. <button class="btn btn-success" @click="createListFromJson()">Save New List From JSON</button>
              </div>
            </div>      
                                                 
          </div>
          <div class="tab-pane fade show mw-100" id="pills-json-sample" role="tabpanel" aria-labelledby="pills-json-sample-tab" tabindex="0">
            
            <div class="card text-dark bg-info mb-3 d-flex flex-grow-1">
              <div class="card-body d-flex flex-grow-1">
<pre>
  {
    "listName": "ENTER_NAME",
    "listDescription": "LIST_DESCRIPTION",
    "columns": [
      {
        "header": "Column1",
        "columnType": "string|integer|boolean|currency|link"
      },
      {
        "header": "Column2",
        "columnType": "string|integer|boolean|currency|link"
      }    
    ],
    "items": [
      { "Column1":"somestringvalue","Column2":1234 },
      { "Column1":"anotherstring","Column2":6789 }
    ]
  }
</pre>
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
