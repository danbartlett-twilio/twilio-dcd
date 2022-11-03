<script>
  import { ref, reactive, onBeforeMount } from 'vue'
  import { useRoute, useRouter } from 'vue-router'  
  

  export default {
    setup() {

      const route = useRoute();
      const documentSid = route.params.id;
      
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

      const prettyJson = ref("");
      function formatJson() {
        prettyJson.value = JSON.stringify(doc.doc.data, null, 4)
      }

      onBeforeMount(async () => {        
        await getDocument();  
        formatJson();
      })

      return {
        documentSid, doc, prettyJson
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
                {{doc.doc?.uniqueName}}
                <i class="bi-eye"></i>
              </h3>
            </h3>        
          </div>
          <div class="col text-end">
              <router-link :to="{name:'documentEdit', params: {id: documentSid } }" class="btn btn-warning"><i class="bi-pencil"></i></router-link>
          </div>
        </div>

      </div>
      
      <div class="card-body">
        <pre>{{prettyJson}}</pre>
      </div>
    
    </div>


  </div>
</template>

<style scoped>
</style>
