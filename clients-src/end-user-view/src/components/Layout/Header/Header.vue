<script>
import { RouterLink } from 'vue-router'

export default {
    name: 'Header',
    setup() {      

        return {

        }
    }
}
</script>

<template>

    <div class="container-fluid">

        <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
            <router-link class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none" to="/">
                <img class="me-4" width="107" height="32" src="https://www.twilio.com/docs/static/dist/img/559bc7cf.svg"/>    
                <span class="fs-4" style="color:#f22f46;">Conversations (End User)</span>
            </router-link>
            <ul class="nav nav-pills">        
                <li class="nav-item"><router-link class="btn btn-info btn-sm" to="/"><i class="bi-house"></i> Home</router-link></li>
            </ul>            
        </header>
        
    </div>

</template>

