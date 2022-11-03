<script>
  import { ref } from 'vue'
  import { toCurrency } from '../composables/tocurrency.js'

  export default {
    props: ['tableSid', 'columns', 'item'],
    emits: ['showToast','deleteItem'],
    setup(props, { emit } ) {

      const edit = ref(false)
      const columns = props.columns;
      const item = props.item;
      const tableSid = props.tableSid;        
    
      const saveItemChanges = async () => {
        
        // FORMAT THE UPDATE PAYLOAD
        let payload = {};
        columns.forEach(c => {            
            console.log("c.header => ",c.header);
            console.log("item.data[c.header] => ",item.data[c.header]);

            if (c.columnType==='boolean') {
                item.data[c.header] = (item.data[c.header] === 'true') ? true : false;    
                payload[c.header] = item.data[c.header];
            } else {
                payload[c.header] = item.data[c.header];
            }            
        });

        // MAKE THE UPDATE POST CALL
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-update?targetList=${tableSid}`;          
        url += `&listItemIndex=${item.index}`;

        const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": payload}) });
        if (res.ok) {
            console.log("Updated item...");
            edit.value = false;          
            emit('showToast','success','Success! Item updated!');
        }        

      }

      return {
        columns, item, edit, tableSid, saveItemChanges, toCurrency: toCurrency
      }
    }
  }

</script>

<template>
    <tr>  
        <td class="text-center"  v-for="c in columns" v-bind:key="c.header">
            <div v-show="!edit">
                <span v-if="c.columnType==='string'">{{item.data[c.header]}}</span>
                <span v-if="c.columnType==='link'"><a :href="item.data[c.header]">View</a></span>
                <span v-if="c.columnType==='integer'">{{item.data[c.header]}}</span>
                <span v-if="c.columnType==='boolean'">
                    <span v-if="Boolean(item.data[c.header])" class="badge bg-success">true</span>
                    <span v-if="!Boolean(item.data[c.header])" class="badge bg-danger">false</span>                    
                </span>
                <span v-if="c.columnType==='currency'">{{toCurrency(item.data[c.header])}}</span>
            </div>
            <div v-show="edit">
                <input v-if="c.columnType==='string'" v-model="item.data[c.header]" type="text" class="form-control">    
                <input v-if="c.columnType==='integer'" v-model="item.data[c.header]" type="number" class="form-control"> 
                <input v-if="c.columnType==='link'" v-model="item.data[c.header]" type="text" class="form-control">       
                <select v-if="c.columnType==='boolean'" v-model="item.data[c.header]" class="form-control">                    
                    <option value=true :selected="Boolean(item.data[c.header])===true" >TRUE</option>
                    <option value=false :selected="Boolean(item.data[c.header])===false" >FALSE</option>
                </select>
                <div class="input-group" v-if="c.columnType==='currency'">
                    <span class="input-group-text">$</span>
                    <input type="number"  v-model="item.data[c.header]" class="form-control" aria-label="Amount (to the nearest dollar)">                
                </div>                
            </div>
        </td>
        <td class="text-center">
            <div class="btn-group" role="group" aria-label="Basic example" v-show="!edit">
                <button type="button" @click="edit = !edit" class="btn btn-warning btn-sm"><i class="bi bi-pencil"></i></button>                
                <button type="button" @click="$emit('deleteItem',item.index)" class="btn btn-danger btn-sm"><i class="bi bi-trash"></i></button>
            </div>
            <div class="btn-group" role="group" aria-label="Basic example" v-show="edit">                
                <button type="button" @click="saveItemChanges()" class="btn btn-success btn-sm"><i class="bi bi-save"></i></button>
                <button type="button" @click="edit = !edit" class="btn btn-light btn-sm"><i class="bi bi-x"></i></button>
            </div>

        </td>        
    </tr>
</template>

<style scoped>
</style>
