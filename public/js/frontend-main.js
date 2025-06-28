document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.querySelector(".send-btn");
  function appendMessage(text, sender) {
    let chatMessages = document.getElementById('chat-messages')
    // const messageElement = document.createElement('div');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    // Sanitize text before adding it to prevent XSS
    messageElement.textContent = text; 
    this.elements.chatMessages.appendChild(messageElement);

    // Scroll to the latest message
    this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
}
//   sendBtn.addEventListener("click", async () => {
//     alert("Send button clicked");
//     const inp = document.querySelector(".chat-input").value;


//     const response = await fetch("/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify({prompt:true ,  transcript: inp}),
//       });

//       // Handle response
//       const responseData = await response.json();
//         if (responseData.success) {
//             console.log("API Success:", responseData);
//             // Update UI message
//             // const centerText = document.querySelector(".center-text");
//             // if (centerText) centerText.textContent = responseData.message || "I'm having issues right now";
//             console.log("Response message:", responseData.message);
//             let message = responseData.message

//             appendMessage(message, "ai");   
//         } else {
//             console.error("API Error:", responseData);
//             alert(responseData.message || "Request failed");
//         }
//     alert(inp);
//   });
  const orb = document.querySelector(".spline_orb_container");

  console.log(orb);
  var isAiSpeaking = false;
  var state = "stop";
  var r = new webkitSpeechRecognition();
  var finalTranscripts = "";
  if (!r) {
    console.log("speech recog api not found");
  }

  r.continuous = true;
  r.interimResults = true;
  r.lang = "en-US";

  console.log(r);

  orb.addEventListener("click", () => {
    // alert("button clicked")
    if (state === "stop") {
      state = "start";
      // alert(state)
      r.start();
    } else if (state === "start") {
      state = "stop";
      r.stop();
    }
  });

  r.onresult = function (event) {
    var interimTranscripts = "";
    for (var i = event.resultIndex; i < event.results.length; i++) {
      var transcript = event.results[i][0].transcript;
      transcript.replace("\n", "<br>");
      if (event.results[i].isFinal) {
        finalTranscripts += transcript;
      } else {
        interimTranscripts += transcript;
      }
    }
  };

  r.onend = () => {
    console.log(finalTranscripts);
    sendTranscriptToBackend();
  };

  async function sendTranscriptToBackend() {
    try {
      // Get user input if empty
      if (!finalTranscripts || finalTranscripts.trim().length === 0) {
        const userInput = prompt("Please type your message:");
        if (!userInput) return; // Exit if user cancels
        finalTranscripts = userInput.trim();
      }

      // Format time (HH:MM)
      const now = new Date();
      const time = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Prepare request data
      const requestData = {
        transcript: finalTranscripts,
        time: time,
      };

      // Send to backend
      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestData),
      });

      // Handle response
      const responseData = await response.json();

      if (responseData.success) {
        console.log("API Success:", responseData);

        // Update UI message
        const message = responseData.message || "I'm having issues right now";
        const centerText = document.querySelector(".center-text");
        if (centerText) centerText.textContent = message;

        // Handle audio playback
        const base64Audio = responseData.audioData;
        if (base64Audio && base64Audio.length > 0) {
          const audioSrc = `data:audio/wav;base64,${base64Audio}`;
          console.log("Playing audio:", audioSrc);

          const audio = new Audio(audioSrc);
          audio.onended = () => (isAiSpeaking = false);

          await audio
            .play()
            .then(() => (isAiSpeaking = true))
            .catch((err) => {
              console.error("Playback failed:", err);
              isAiSpeaking = false;
            });
        } else {
          console.warn("No audio received");
          isAiSpeaking = false;
        }
      } else {
        console.error("API Error:", responseData);
        alert(responseData.message || "Request failed");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Failed to connect to server");
    } finally {
      finalTranscripts = ""; // Always clear transcript
    }
  }


});
