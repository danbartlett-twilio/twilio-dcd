import { defineStore } from 'pinia'
import { useListStore } from './listStore'

export const useChatButtonStore = defineStore('chatButtons', {
  state: () => ({ 
    chatbuttons: []
  }),
  getters: {},
  actions: {    
    async getChatButtons() {
      const listStore = useListStore()  
      const cbObj = listStore.lists.find(o => o.uniqueName === 'ChatButtonList');                
      try {                
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${cbObj.sid}`;                        
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
        if (res.ok) {
          let r = await res.json();
          //console.log("in chatButtonStore getChatButtons and r => ", r);              
          this.chatbuttons = r;            
        }
        
      } catch (e) { console.log("in chatButtonStore getChatButtons error => ", e); }      

    }

  }

})