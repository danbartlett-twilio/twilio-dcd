<template>
    <div>
        <Header />
        <slot />
        <Footer />    
    </div>
</template>

<script>
import Header from './Header/Header.vue'
import Footer from './Footer/Footer.vue'

export default {
  name: 'Layout',
  components: {
    Header,
    Footer
  }
}
</script>