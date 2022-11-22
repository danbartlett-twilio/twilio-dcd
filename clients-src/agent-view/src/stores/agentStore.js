import { defineStore } from 'pinia'
import { useListStore } from '../stores/listStore'

export const useAgentStore = defineStore('agent', {
  state: () => ({ 
    agent: {
      identity: null,    
      accessToken: ""
    }, 
    agents: []
  }),
  getters: {},
  actions: {    
    async getToken() {    
      try {        
        let url = `${import.meta.env.VITE_DATA_URL}/auth/token?identity=${this.agent.identity}`;          
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} })
        //console.log("res => ", res);
        if (res.ok) {
          let r = await res.json();
          //console.log("getToken r => ", r);          
          //console.log(typeof r.accessToken);
          this.agent.accessToken = r.accessToken;
          console.log("token value set...");
        } 
      } catch (e) { console.log("getToken error => ", e); }          
    },
    async getAgents() {
      const listStore = useListStore()  
      const agentObj = listStore.lists.find(o => o.uniqueName === 'AgentList');                
      try {                
        let url = `${import.meta.env.VITE_DATA_URL}/sync/list-item-get-array?targetList=${agentObj.sid}`;                        
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
        if (res.ok) {
          let r = await res.json();
          //console.log("in getAgents and r => ", r);              
          this.agents = r.map(a => a.data['Identity']).sort((a, b) => {return a.localeCompare(b, undefined, {sensitivity: 'base'});});              
        }
        
      } catch (e) { console.log("getAgents error => ", e); }      

    }

  }

})