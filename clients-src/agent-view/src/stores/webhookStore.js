import { defineStore } from 'pinia'
import { useListStore } from '../stores/listStore'

export const useWebhookStore = defineStore('webhooks', {
  state: () => ({ 
    webhooks: []
  }),
  getters: {},
  actions: {    
    async getWebhooks() {
      const listStore = useListStore()  
      const whObj = listStore.lists.find(o => o.uniqueName === 'WebhookList');                
      try {                
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${whObj.sid}`;                        
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
        if (res.ok) {
          let r = await res.json();
          console.log("in webhookStore getWebhooks and r => ", r);              
          this.webhooks = r;            
        }
        
      } catch (e) { console.log("in webhookStore getWebhooks error => ", e); }      

    }

  }

})