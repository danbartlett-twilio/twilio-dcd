import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useEndUserStore = defineStore('end-user', {
  state: () => ({     
    endUser: useStorage(
      'endUser',
      {
        name: "",   
        avatar: "",    
        accessToken: "",
        supportConversation: ""
      },
      localStorage,
      { mergeDefaults: true } 
    )
  }),
  getters: {},
  actions: {   
    async getToken() {    
      try {        
        let url = `${import.meta.env.VITE_DATA_URL}/auth/token?identity=${this.endUser.name}`;          
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} })
        //console.log("res => ", res);
        if (res.ok) {
          let r = await res.json();
          //console.log("getToken r => ", r);          
          //console.log(typeof r.accessToken);
          this.endUser.accessToken = r.accessToken;
          console.log("token value set...");
        } 
      } catch (e) { console.log("getToken error => ", e); }          
    },
    logout() {
      this.endUser.name = ""
      this.endUser.avatar = "",
      this.endUser.accessToken = "", 
      this.endUser.supportConversation = "none"    
    }       
  }

})
