export function formatDate(d) {    
    let date = new Date(d);
    return `${date.getMonth()+1}/${date.getDate()} @ ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}  