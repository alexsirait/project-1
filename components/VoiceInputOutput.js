import React, { useState, useEffect } from "react";
import Script from 'next/script';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { FaMicrophone, FaSpinner, FaCheck, FaStop, FaRocket } from "react-icons/fa";

const VoiceInputOutput = () => {
  const { transcript, resetTranscript } = useSpeechRecognition();
  const [response, setResponse] = useState("");
  const [typedResponse, setTypedResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const playTingSound = () => {
    const audio = new Audio("/beep-22.mp3");
    audio.play();
  };

  useEffect(() => {
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      alert("Browser Anda tidak mendukung pengenalan suara. Gunakan Chrome atau Edge.");
    }
  }, []);

  const handleStartListening = () => {
    setIsListening(true);
    playTingSound();
    SpeechRecognition.startListening({ continuous: true, language: 'id-ID' });
  };

  const handleStopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
    playTingSound();
  };

  const handleResponsiveVoiceTTS = (text) => {
    if (typeof window !== "undefined" && window.responsiveVoice) {
      setIsSpeaking(true);
      window.responsiveVoice.speak(text, "Indonesian Male", {
        onend: () => {
          playTingSound();
          setIsSpeaking(false);
        },
      });
    } else {
      alert("ResponsiveVoice tidak tersedia.");
    }
  };

  const handleAskAPI = async (prompt) => {
    if (!prompt) {
        alert("Masukkan pertanyaan atau gunakan pengenalan suara.");
        return;
    }

      try {
          const response = await fetch("http://127.0.0.1:8000/api/assistant/prompt_view", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt, user_id: "alex" }),
          });

          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

          const data = await response.json();
          const cleanedResponse = data.response.replace(/[^\w\s.,?'"\-()!]/g, "");
          const finalResponse = cleanedResponse.split("Key Entities")[0].trim();

          // Periksa apakah respons bot sudah ada dalam chat history
          const isDuplicate = chatHistory.some(
              (item) => item.type === "bot" && item.text === finalResponse
          );
          if (isDuplicate) return; // Jika respons duplikat, hentikan eksekusi

          // Tambahkan pesan pengguna ke chat history
          setChatHistory((prev) => [
              ...prev,
              { type: "user", text: prompt, timestamp: new Date().toLocaleTimeString() },
          ]);

          // Variabel untuk menampilkan karakter demi karakter
          const characters = finalResponse.split("");
          let displayedText = "";
          let currentCharIndex = 0;

          // Tambahkan placeholder untuk respons bot di awal
          let botMessageIndex = -1;
          setChatHistory((prev) => {
              const updated = [...prev];
              botMessageIndex = updated.length; // Simpan indeks pesan bot
              updated.push({
                  type: "bot",
                  text: "",
                  timestamp: new Date().toLocaleTimeString(),
                  complete: false,
              });
              return updated;
          });

          // Fungsi untuk memperbarui teks
          const updateText = () => {
              if (currentCharIndex < characters.length) {
                  displayedText += characters[currentCharIndex];
                  setChatHistory((prev) => {
                      const updated = [...prev];
                      updated[botMessageIndex].text = displayedText;
                      return updated;
                  });
                  currentCharIndex++;
              }
          };

          // Trigger TTS dan sinkronisasi dengan karakter
          const estimatedWPM = 150; // Kecepatan rata-rata TTS
          const charInterval = (60000 / (estimatedWPM * 5)); // Waktu per karakter dalam ms

          responsiveVoice.speak(finalResponse, "Indonesian Female", {
              onstart: () => {
                  const textInterval = setInterval(() => {
                      updateText();
                      if (currentCharIndex >= characters.length) {
                          clearInterval(textInterval);
                          setChatHistory((prev) => {
                              const updated = [...prev];
                              updated[botMessageIndex].complete = true;
                              return updated;
                          });
                      }
                  }, charInterval);
              },
              onend: () => {
                  // Tandai pesan bot sebagai selesai saat TTS selesai
                  setChatHistory((prev) => {
                      const updated = [...prev];
                      updated[botMessageIndex].complete = true;
                      return updated;
                  });
              },
          });
      } catch (error) {
          console.error("Error fetching data:", error);
          alert("Terjadi kesalahan saat menghubungi API.");
      }
  };

  const handleVoiceInteraction = async () => {
    setIsProcessing(true);
    handleStopListening();
    setTypedResponse('');

    if (transcript) {
      await handleAskAPI(transcript);
      resetTranscript();
    } else {
      alert("Tidak ada teks dari pengenalan suara.");
    }

    setIsProcessing(false);
  };

  const toggleListening = () => {
    if (isSpeaking) {
      window.responsiveVoice.cancel();
      setTypedResponse('');
      setIsSpeaking(false);
      alert("TechFusion Berhenti berbicara.");
    } else if (!isListening && !isProcessing) {
      handleStartListening();
    } else if (isListening) {
      handleVoiceInteraction();
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAskAPI(inputPrompt);
      setInputPrompt("");
    }
  };

  const buttonStyles = {
    base: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      fontSize: "15px",
      color: "white",
      border: "none",
      cursor: "pointer",
      outline: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
    },
    ready: { backgroundColor: "#4caf50", transform: "scale(1)" },
    listening: { backgroundColor: "#2196f3", transform: "scale(1.1)", animation: "pulse 1s infinite" },
    processing: { backgroundColor: "#ff9800", transform: "scale(1.2)", animation: "spin 1s linear infinite" },
    speaking: { backgroundColor: "#ff5722", transform: "scale(1.2)", animation: "pulse 1s infinite" },
    keyframes: `
      @keyframes pulse {
        0% { transform: scale(1.1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1.1); }
      }
      @keyframes spin {
        from { transform: rotate(0deg) scale(1.2); }
        to { transform: rotate(360deg) scale(1.2); }
      }
    `,
  };

  const currentStyle = isSpeaking
    ? buttonStyles.speaking
    : isListening
    ? buttonStyles.listening
    : isProcessing
    ? buttonStyles.processing
    : buttonStyles.ready;

  const currentIcon = isSpeaking
    ? <FaStop />
    : isListening
    ? <FaMicrophone />
    : isProcessing
    ? <FaSpinner />
    : <FaRocket />;

  useEffect(() => {
    if (response) {
      setTypedResponse('');
      let index = 0;
      const typingInterval = setInterval(() => {
        setTypedResponse((prev) => prev + response[index]);
        index += 1;
        if (index === response.length) {
          clearInterval(typingInterval);
        }
      }, 95);

      return () => clearInterval(typingInterval);
    }
  }, [response]);

  return (
    <><div
      style={{
        position: "fixed",
        top: "60px",  // Menentukan jarak dari atas layar
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "20px",
        fontWeight: "bold",
        // color: "#4caf50",
        zIndex: 1000,   
        width: "40%"
      }}
    >
      <center>
      TechFusion <br/> AI Presentation Assistant
      </center>
      {/* Avatar Section */}
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column",
              justifyContent: "center", }}>
        {isSpeaking ? (
          <img
            src="/ai-talking-avatar1.gif"
            alt="AI Avatar"
            style={{
              width: "400px",
              height: "250px",
              borderRadius: "15px",
              border: "2px solid #000",
              alignSelf: "center" 
            }}
          />
        ) : (
          <img
            src="/ai-avatar1.PNG"
            alt="AI Avatar"
            style={{
              width: "400px",
              height: "250px",
              borderRadius: "15px",
              border: "2px solid #000",
              alignSelf: "center"
            }}
            />
          )}

        <div>
          <div className="chat-history" style={{ maxHeight: "400px", overflowY: "auto", margin: "20px 0", display: "flex", flexDirection: "column" }}>
          {chatHistory.map((chat, index) => (
            <div key={index} style={{
              display: "flex",
              flexDirection: chat.type === "user" ? "row-reverse" : "row",
              alignItems: "center",
              marginBottom: "10px",
            }}>
              <div style={{
                padding: "10px",
                backgroundColor: chat.type === "user" ? "#6261ad" : "#f1f1f1",
                color: chat.type === "user" ? "white" : "black",
                borderRadius: "12px",
                maxWidth: "80%",
                fontSize:"15px",
                fontWeight: "normal"
              }}>
                {chat.text}
              </div>
              <div style={{ fontSize: "12px", color: "#555", margin: "0 10px" }}>
                {chat.timestamp}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
     
    </div>
  
      <div id="test" style={{ textAlign: "center", marginTop: "" }}>
        <Script
          src={`https://code.responsivevoice.org/responsivevoice.js?key=vDZj5V8V`}
          strategy="beforeInteractive"
        />
        <style>{buttonStyles.keyframes}</style>
        {/* end history chat */}

        {/* Button Section */}
        <div style={{ position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 999, display: "flex", alignItems: "center" }}>
          <button
            onClick={toggleListening}
            disabled={isProcessing}
            style={{
              ...buttonStyles.base,
              ...currentStyle,
            }}
            aria-pressed={isListening}
            aria-busy={isProcessing}
          >
            {currentIcon}
          </button>
          
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message TechFusion"
            style={{
              marginLeft: "10px",
              width: "300px",
              padding: "10px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              outline: "none",
            }}
          />
        </div>
      </div>
    </>
  );
};

export default VoiceInputOutput;
