<script>
import Layout from '../components/Layout/Layout.vue'
import Conversation from '../components/Conversation.vue'

export default {
  name: 'App',
  components: {
    Layout, Conversation
  }
}
</script>

<template>  
  <Layout>
    <Conversation />
  </Layout>  
</template>