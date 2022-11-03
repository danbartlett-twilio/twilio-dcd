<script>
  import { ref, onMounted } from 'vue'
  
  export default {

    setup() {

      const envVariables = ref([]);
      const syncServiceSid = ref("");

      const getEnvironmentVariables = async () => {


        try {
            let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/system/return-all-variables`;            
            const res = await fetch(url, { method: "GET", headers: {'Content-type': 'application/json'} });
            console.log("res => ", res);
            if (res.ok) {
              let r = await res.json();
              console.log("in getEnvironmentVariables and r => ", r);
              envVariables.value = r;
              envVariables.value.forEach(v => {
                if (v.key === "TWILIO_SYNC_SERVICE_SID") {
                  syncServiceSid.value = v.value;
                }
              })
            }
        } catch (e) {
          envVariables.value = [];
          syncServiceSid.value = "";
          console.log("Error in getEnvironmentVariables => ", e)
        }
      
      }

      const isEnvSet = ref (true);

      onMounted(async () => {        
        await getEnvironmentVariables();           
        if (syncServiceSid.value === "") {
          isEnvSet.value = false;
        }
      })

      return {
        envVariables, syncServiceSid, isEnvSet
      }
    }
  }

</script>

<template>
  <div class="container pt-3">
    <h1 class="mb-5">TwilioTable > Settings</h1>

    <p class="fs-5">
      TwilioTable needs a Sync Service. The SID for the Sync Service is stored as 
      an environment variable in your Function Service. The easiest way to set your
      Sync Service SID is by adding it to the .env file.
    </p>
    <p class="fst-italic">TWILIO_SYNC_SERVICE_SID=ISXXXXXXXXXXXXXXXXXXXXXX</p>

    <div class="mb-3">
      <label for="exampleFormControlInput1" class="form-label">Twilio Sync Service SID</label>
      <input v-model="syncServiceSid" type="text" class="form-control" :class="{'is-valid':isEnvSet, 'is-invalid':!isEnvSet}" disabled="disabled">
    </div>
    <div class="alert alert-success" v-show="isEnvSet">
      Excellent! You have created a sync service and set the SID in the .env 
      file for the Service. 
    </div>
    <div class="alert alert-danger" v-show="!isEnvSet">
      You need to create a sync service and then add the SID to the .env 
      file for this Service. Be sure to redeploy. Return to this page when 
      you are done. 
    </div>    

  </div>
</template>

<style scoped>
</style>
