<script>  
  export default {
    setup() {}
  }
</script>

<template>
  <div class="container pt-3">
    <h1 class="mb-5">Sync Helper > About</h1>
    
    <p>
      Sync Helper was created because demos and POCs need a persistence
      layer and Twilio has Twilio Sync. We should be able to use Sync for simple
      use cases. Sync Helper includes a SPA front end to manage lists of data and
      a set of functions to CRUD the data.
    </p>
    <p>
      You can also manage you data directly from the Twilio Console.
    </p>
    <p>
      Since Sync Helper is in the Twilio platfom so it is easy to integrate with
      Twilio products like Twilio Functions, Studio, Flex, Conversations API, and more.
    </p>
    <p>
      To use Sync Helper, you just need to create a Twilio Sync Service, set the SID 
      in the .env file for the Sync Helper Functions Service, and then access the data
      from a browser.
    </p>


  </div>
</template>

<style scoped>
</style>
