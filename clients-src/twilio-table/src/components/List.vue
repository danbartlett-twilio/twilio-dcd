<script>
  import { ref, reactive, watch, onBeforeMount, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useSyncStore } from '../stores/syncStore'
  import ItemRow from './ItemRow.vue'
  import { useToast } from "vue-toastification";
  import { useCheckMainSid } from '../composables/check-main-sid.js'

  export default {
    components: {
     ItemRow
    },
    setup() {

      const syncStore = useSyncStore() 
          
      const route = useRoute();
      const tableSid = route.params.id;
      
      const toast = useToast();
      
      const addRow = ref(false)
      const addByJson = ref(false)
      const newRow = reactive({})
      const pageObject = reactive({ listData:[], listItems:[] })

      // GET LIST DETAILS FROM TwilioTableMain
      const getListData = async () => {
        
        try {
          if (syncStore?.twilioTableSID !== null) {
            let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${syncStore.twilioTableSID}&filterField=listSid&filterFieldValue=${tableSid}`;
            const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
            if (res.ok) {
              let r = await res.json();
              console.log("in getListData and r => ", r);
              pageObject.listData = r[0];
            }
          }
        } catch (e) {
          console.log("Error in getListData => ", e)
        }
      
      }
      
      // GET "ROWS" OF DATA FROM LIST
      const getListItems = async () => {
        
        pageObject.listItems = [];

        try {          
          let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${tableSid}&ts=${Date.now()}`;
          const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
          if (res.ok) {
            let r = await res.json();
            console.log("in getListItems and r => ", r);   
            pageObject.listItems = r;
          }          
          
        } catch (e) { console.log("getListItems error => ", e); }
      
      }

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

      const addRowsFromJson = async () => {
        try {
          let parsedJson = JSON.parse(jsonInput.value);

          await Promise.all(parsedJson.columns.map(async (item) => {
            await saveNewItemObject(item)
          })).then(() => {         
            console.log("saved rows...") 
            addRow.value = false;
            addByJson.value = false;
            jsonParseError.value = false;
            jsonReady.value = false;
            toast.success("Success! New rows added! Updating...");
            setTimeout(async function(){          
              await getListItems();            
            }, 4000);
          })
        } catch(e) {
          jsonParseError.value = true;
          jsonReady.value = false;
          console.log("Error in addRowFromJson => ",e);
        }
      }

      // SAVE A NEW ITEM TO THE LIST (USED WHEN PARSING JSON)
      const saveNewItemObject = async (p) => {
        console.log("in saveNewItemObject...")     
        
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-create?targetList=${tableSid}`;
        return await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": p}) });

      }

      // SAVE A NEW ITEM TO LIST VIA TABLE ROW
      const saveNewItem = async () => {
              
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-create?targetList=${tableSid}`;
        const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": newRow}) });
        if (res.ok) {          
            toast.success("Success! New item added. Updating");
            setTimeout(async function(){          
              addRow.value = false;
              pageObject.listData?.data.columns.forEach(h => newRow[h.header] = "");                      
              await getListItems();            
            }, 3000);
        }        

      }

      const deleteItem = async (i) => {
              
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-delete?targetList=${tableSid}&listItemIndex=${i}`;
        const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'} });
        if (res.ok) {
          toast.warning("Success!Item deleted.Updating...");
          setTimeout(async function(){                    
          await getListItems();          
          }, 3000);        
        }
      }

      function showToast(mt, msg) {
        toast[mt](msg);
      }

      const sampleJson = ref("");

      function generateSampleJson() {
        let y = '{\n  "columns": [\n';
        let yy = "{";
        pageObject.listData.data?.columns.forEach((d) => {
            yy += `"${d.header}":`;            
            if (d.columnType === "integer") { yy += 123; }
            else if (d.columnType === "boolean") { yy += true; }
            else if (d.columnType === "currency") { yy += 123; }
            else { yy += '"somestring"'; }
            yy +=",";
        })
        let z = yy.slice(0, -1);
        z += "}";
        y += `    ${z},\n    ${z},\n    ${z}\n`
        y += '  ]\n}';
        sampleJson.value = y;
      }

      const jsonExport = ref("");
      function generateJsonExport() {
        let exp = {
          listName: pageObject.listData?.data?.listName,
          listDescription: pageObject.listData?.data?.listDescription,
          columns: pageObject.listData.data?.columns,
          items: []
        };
        pageObject.listItems.forEach(i => {
          exp.items.push(i.data)
        })
        jsonExport.value = JSON.stringify(exp);
      }

      watch(
        () => pageObject.listItems,
        (listItems) => {
          console.log(`listItems Length: ${listItems.length}`)
        }
      )

      onBeforeMount(()  => {
        // MAKE SURE THAT MAIN TABLE SID IS SET
        useCheckMainSid();        
      })

      onMounted(async () => {        
        await getListData();   
        await getListItems();  
      })

      return {
        tableSid, pageObject, addRow, syncStore, newRow, saveNewItem, deleteItem, showToast,
        parseJsonForm, jsonInput, jsonParseError, jsonReady, addRowsFromJson, addByJson,
        generateSampleJson, sampleJson, jsonExport, generateJsonExport, getListItems
      }
    }
  }

</script>

<template>
  <div class="container-fluid pt-3">
    <div class="card">
      <div class="card-header">
        <div class="row">
          <div class="col">
            <h3>
              <h3>
                {{pageObject.listData?.data?.listName}}
                <i class="bi-eye"></i>
              </h3>
              <span class="text-muted">{{pageObject.listData?.data?.listDescription}}</span>
            </h3>        
          </div>
          <div class="col text-end">
              <router-link :to="{name:'listEdit', params: {id: tableSid } }" class="btn btn-warning"><i class="bi-pencil"></i></router-link>
          </div>
        </div>

      </div>
      
      <div class="card-body">
        <p>
          <button class="btn btn-primary me-2" @click="addRow = !addRow"><i class="bi-plus-circle-fill"></i> Add Row</button>
          <button class="btn btn-secondary" @click="addByJson = !addByJson"><i class="bi-filetype-json"></i> Add Row By JSON</button>
        </p>
          
          <div v-show="addByJson">

            <h4>Add new rows via JSON</h4>

            <p class="lead">
              Add new rows from JSON.
            </p>
            <ul class="nav nav-tabs mb-3" id="pills-tab" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="pills-json-tab" data-bs-toggle="pill" data-bs-target="#pills-json" type="button" role="tab" aria-controls="pills-json" aria-selected="true">JSON Input</button>
              </li>
              <li class="nav-item" role="presentation">
                <button @click="generateSampleJson()" class="nav-link" id="pills-json-tab" data-bs-toggle="pill" data-bs-target="#pills-json-sample" type="button" role="tab" aria-controls="pills-json-sample" aria-selected="false">Sample JSON</button>
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
                  <div>
                    Your JSON checked out. <button class="btn btn-success" @click="addRowsFromJson()">Add Rows From JSON</button>
                  </div>
                </div>      
                                                    
              </div>
              <div class="tab-pane fade show mw-100" id="pills-json-sample" role="tabpanel" aria-labelledby="pills-json-sample-tab" tabindex="0">
                
                <div class="card text-dark bg-info mb-3 d-flex flex-grow-1">
                  <div class="card-body d-flex flex-grow-1">
                  <pre>{{sampleJson}}</pre>
                  </div>                    
                </div>                    
              </div>
            </div>

          </div>

          <p class="text-end">
            <button class="btn btn-info btn-sm" @click="getListItems()">
              <i class="bi-arrow-clockwise"></i>
              Refresh
            </button>
          </p>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th v-for="th in pageObject.listData.data?.columns" v-bind:key="th.header" scope="col" class="text-center">{{ th.header }}</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-show="addRow">
                  <td v-for="rth in pageObject.listData.data?.columns" v-bind:key="rth.header" scope="col">
                    <input v-if="rth.columnType==='string'" v-model="newRow[rth.header]" type="text" class="form-control" :placeholder="rth.header">    
                    <input v-if="rth.columnType==='integer'" v-model="newRow[rth.header]" type="integer" class="form-control" :placeholder="rth.header">    
                    <input v-if="rth.columnType==='link'" v-model="newRow[rth.header]" type="text" class="form-control" :placeholder="rth.header">    
                    <select v-if="rth.columnType==='boolean'" v-model="newRow[rth.header]" class="form-control">                    
                        <option value=true :selected="Boolean(newRow[rth.header])===true" >TRUE</option>
                        <option value=false :selected="Boolean(newRow[rth.header])===false" >FALSE</option>
                    </select>
                    <div class="input-group" v-if="rth.columnType==='currency'">
                        <span class="input-group-text">$</span>
                        <input type="number"  v-model="newRow[rth.header]" class="form-control" aria-label="Amount (to the nearest dollar)">                
                    </div>                
                  </td>                      
                  <td class="text-center">
                    <button class="btn btn-sm btn-success" @click="saveNewItem()">SAVE</button>
                  </td>
                </tr>
                
                <ItemRow v-for="r in pageObject.listItems" 
                    v-bind:key="r.index" scope="col" 
                    :columns="pageObject.listData.data?.columns" :item="r" :tableSid="tableSid" 
                    @show-toast="(mt, msg) => showToast(mt, msg)"
                    @delete-item="(i) => deleteItem(i)"
                />

              </tbody>
            </table>
          </div>
          <div class="mt-5 text-end">
            <button @click="generateJsonExport()" type="button" class="btn btn-dark btn-sm" data-bs-toggle="modal" data-bs-target="#exportModal">
              <i class="bi-arrow-bar-down"></i>
              Export List JSON
            </button>
          </div>
      </div>
    
    </div>



    <div class="modal fade" id="exportModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Export List JSON</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Copy the JSON below to export the list.</p>
            <p class="fst-italic">{{ jsonExport }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
</style>
