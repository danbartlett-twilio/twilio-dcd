import { defineStore } from 'pinia'

export const useListStore = defineStore('list', {
  state: () => ({ lists: [] }),
  getters: {},
  actions: {    
    async getAllSyncLists() {    
      try {
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-all`;          
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} })
        //console.log("res => ", res);
        if (res.ok) {
          let r = await res.json();
          //console.log("getAllSyncLists r => ", r);
          this.lists = r;
        } 
      } catch (e) { console.log("getAllSyncLists error => ", e); }
    
    }
  }
})
