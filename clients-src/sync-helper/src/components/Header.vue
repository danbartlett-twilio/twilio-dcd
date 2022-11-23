<script setup>

import { RouterLink } from 'vue-router'

</script>

<template>
    <header class="p-1 bg-dark text-white">
      <div class="container">
        <div class="d-flex align-items-center justify-content-sm-start">
          <a href="/" class="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none">
            <img style="max-height:50px;" class="img-fluid" src="/logo-twilio-mark-red.png" />
          </a>

          <ul class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
            <li><router-link class="nav-link px-2 text-white" to="/about">Sync Helper</router-link></li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle px-2 text-white" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Lists
              </a>
              <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><router-link class="dropdown-item" to="/list-list">All Lists</router-link></li>
                <li><router-link class="dropdown-item" to="/list-edit/new">New List</router-link></li>                
              </ul>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle px-2 text-white" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Docs
              </a>
              <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><router-link class="dropdown-item" to="/document-list">All Documents</router-link></li>
                <li><router-link class="dropdown-item" to="/document-edit/new">New List</router-link></li>                
              </ul>
            </li>            
            <li><router-link class="nav-link px-2 text-white" to="/settings">SID</router-link></li>
            <li><router-link class="nav-link px-2 text-white" to="/about">About</router-link></li>
          </ul>
        </div>
      </div>
    </header>
</template>