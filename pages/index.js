import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore"; 

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [fullTranscript, setFullTranscript] = useState("");

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const micRecognition = new SpeechRecognition();
      micRecognition.continuous = true;
      micRecognition.interimResults = true;
      micRecognition.lang = "id-ID";

      micRecognition.onresult = (event) => {
        let combinedTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          combinedTranscript += event.results[i][0].transcript + " ";
        }
        setFullTranscript(combinedTranscript.trim());
        console.log("Transkrip Berjalan: ", combinedTranscript);
      };

      micRecognition.onerror = (event) => {
        console.error("Error Pengenalan Suara: ", event.error);
      };

      setRecognition(micRecognition);
    } else {
      console.error("Pengenalan suara tidak didukung di browser ini.");
    }
  }, []);

  const startMic = () => {
    if (recognition && !isRecording) {
      recognition.start();
      setIsRecording(true);
      setFullTranscript("");
      console.log("Mikrofon AKTIF");
    }
  };

  const stopMic = async () => {
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
      console.log("Mikrofon NONAKTIF");

      if (fullTranscript) {
        console.log("Teks Lengkap yang Anda ucapkan: ", fullTranscript);

        const docRef = doc(db, "messages", "userMessage1");
        await setDoc(docRef, { message: fullTranscript });
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <button
        onMouseDown={startMic}
        onMouseUp={stopMic}
        onTouchStart={startMic}
        onTouchEnd={stopMic}
        style={{
          padding: "10px 30px",
          fontSize: "16px",
          backgroundColor: isRecording ? "red" : "green",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "120px",
          height: "120px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        {isRecording ? "Stop" : "Start"}
      </button>

      <div
        style={{
          marginTop: "20px",
          fontSize: "18px",
          color: "#white",
          textAlign: "center",
        }}
      >
        <p>{fullTranscript || "Say something..."}</p>
      </div>
    </div>
  );
}
