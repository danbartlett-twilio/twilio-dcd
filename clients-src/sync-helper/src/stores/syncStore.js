import { defineStore } from 'pinia'

export const useSyncStore = defineStore('twilioSync', {
  state: () => ({ 
    twilioTableSID: null
  })
})
