import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore"; // Adjusted import for Firestore

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [lastTranscript, setLastTranscript] = useState("");

  useEffect(() => {
    // Check if the browser supports Speech Recognition
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const micRecognition = new SpeechRecognition();
      micRecognition.continuous = true;
      micRecognition.interimResults = true;

      // When speech is detected, set the last recognized text
      micRecognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setLastTranscript(transcript); // Store the latest transcript
        if (isRecording) {
          console.log("You said: ", transcript);
        }
      };

      setRecognition(micRecognition);
    } else {
      console.error("Speech recognition not supported in this browser.");
    }
  }, []); // Empty dependency array ensures this effect runs only once

  const startMic = () => {
    if (recognition && !isRecording) {
      recognition.start();
      setIsRecording(true);
      console.log("Microphone is ON");
    } else {
      console.error("Speech recognition is already running or not initialized.");
    }
  };

  const stopMic = async () => {
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
      console.log("Microphone is OFF");

      // Log and send the last transcript to Firestore
      if (lastTranscript) {
        console.log("Last thing you said: ", lastTranscript);
        
        // Send the transcript to Firestore (Project 1)
        const docRef = doc(db, "messages", "userMessage1");
        await setDoc(docRef, { message: lastTranscript }); // Send message from Project 1 to Firestore
      }
    } else {
      console.error("Speech recognition is not running or not initialized.");
    }
  };

  const handleMouseDown = (event) => {
    if (event.button === 0) {
      // 0 for left mouse button
      startMic();
    }
  };

  const handleMouseUp = (event) => {
    if (event.button === 0) {
      // 0 for left mouse button
      stopMic();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <button
        onMouseDown={handleMouseDown} // Start mic when mouse button is held down
        onMouseUp={handleMouseUp} // Stop mic when mouse button is released
        style={{
          padding: "10px 30px",
          fontSize: "16px",
          backgroundColor: isRecording ? "green" : "red",
          color: "white",
          border: "none",
          borderRadius: "50%",
          transition: "background-color 0.3s",
          width: "120px",
          height: "120px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isRecording ? (
          <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#e8eaed">
            <path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#e8eaed">
            <path d="m710-362-58-58q14-23 21-48t7-52h80q0 44-13 83.5T710-362ZM480-594Zm112 112-72-72v-206q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v126l-80-80v-46q0-50 35-85t85-35q50 0 85 35t35 85v240q0 11-2.5 20t-5.5 18ZM440-120v-123q-104-14-172-93t-68-184h80q0 83 57.5 141.5T480-320q34 0 64.5-10.5T600-360l57 57q-29 23-63.5 39T520-243v123h-80Zm352 64L56-792l56-56 736 736-56 56Z"/>
          </svg>
        )}
      </button>
    </div>
  );
}
