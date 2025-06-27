const button = document.getElementById("spline-orb");
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

button.addEventListener("click" , ()=>{
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
r.onend = ()=>{
    alert("recording ended")
    console.log(finalTranscripts)
}
// console.log(r)

