const orb = document.querySelector(".spline_orb_container")
console.log(orb)
var isAiSpeaking = false
var state = "stop"
var r = new webkitSpeechRecognition();
var finalTranscripts = ""
if(!r){
    console.log("speech recog api not found")
}

r.continuous = true;
r.interimResults = true;
r.lang = "en-US";

console.log(r)

orb.addEventListener("click" , ()=>{
    // alert("button clicked")
    if(state === "stop"){
        state = "start"
        // alert(state)
        r.start()
    }else if(state === "start"){
        state = "stop"
        r.stop()
    }
})

r.onresult = function(event){
    var interimTranscripts = "";
    for(var i=event.resultIndex; i<event.results.length; i++){
        var transcript = event.results[i][0].transcript;
        transcript.replace("\n", "<br>");
        if(event.results[i].isFinal){
            finalTranscripts += transcript;
        }
        else{
            interimTranscripts += transcript;
        }
    }
};

r.onend = () => {
    console.log(finalTranscripts);
    sendTranscriptToBackend();
};

async function sendTranscriptToBackend() {        time: new Date().toISOString()

    const now = new Date();
    const time = now.toLocaleTimeString('en-GB', {
    hour:   '2-digit',
    minute: '2-digit',
    
    });
    
    const data = {
        transcript: finalTranscripts,
        time: time
    };

    const resposne = await  fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    const responseData = await resposne.json();
    if (responseData.success) {
        console.log("Transcript sent successfully:", responseData);
        let message =   responseData.message || "i am having issues right now ";
        document.querySelector(".center-text").textContent = message; 
        let base64Audio = responseData.audioData;   
        if(base64Audio.length === 0) {
            return
        }else{
            isAiSpeaking = true;
        }
        finalTranscripts = ""; // Clear the transcript after sending
    }

}

