export async function getMediaUrl(mediaSid) {           

    try {                
        let url = `${import.meta.env.VITE_DATA_URL}/conversations/conversation-message-media-url?mediaSid=${mediaSid}`;
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
        if (res.ok) {
            let r = await res.json();                 
            //console.log("getMediaUrl response ==> ", r);
            return r.contentUrl;
        }        
    } catch (e) { console.log("getMediaUrl error => ", e); }      

};