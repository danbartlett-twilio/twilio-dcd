<script>
import Layout from '../components/Layout/Layout.vue'
import Conversations from '@/components/Conversations.vue'

export default {
  name: 'App',
  components: {
    Layout, Conversations
  }
}
</script>

<template>  
  <Layout>
    <Conversations />
  </Layout>  
</template>