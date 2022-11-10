export function formatJustTime(d) {    
    let date = new Date(d);
    return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })    
}  