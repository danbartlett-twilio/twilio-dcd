<script>
import Layout from '@/components/Layout/Layout.vue'
import Agent from '@/components/Agent.vue'

export default {
  name: 'App',
  components: {
    Layout, Agent
  }
}
</script>

<template>  
  <Layout>
    <Agent />
  </Layout>  
</template>