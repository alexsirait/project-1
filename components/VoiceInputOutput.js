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
      window.responsiveVoice.speak(text, "Indonesian Female", {
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
      setResponse(cleanedResponse.split("Key Entities")[0]);
      handleResponsiveVoiceTTS(cleanedResponse.split("Key Entities")[0]);
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
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
        zIndex: 1000, // Agar tetap di atas
      }}
    >
      <center>
      TechFusion <br/> AI Presentation Assistant
      </center>
    </div>
  
      <div style={{ textAlign: "center", marginTop: "" }}>
        <Script
          src={`https://code.responsivevoice.org/responsivevoice.js?key=vDZj5V8V`}
          strategy="beforeInteractive"
        />


        <style>{buttonStyles.keyframes}</style>

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

        {/* Avatar Section */}
        <div style={{ marginTop: "20px" }}>
          {isSpeaking ? (
            <img
              src="/ai-talking-avatar1.gif"
              alt="AI Avatar"
              style={{
                width: "400px",
                height: "250px",
                borderRadius: "15px",
                border: "2px solid #000",
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
              }}
            />
          )}
        </div>

        {/* Teks Efek Ketikan */}
        {typedResponse && (
          <div
            style={{
              fontSize: "18px",
              color: "#333",
              marginTop: "20px",
              width: "500px",
              textAlign: "center",
              padding: "0 10px",
              overflowWrap: "break-word",
            }}
          >
            {typedResponse.replace("undefined", "").trim()}
          </div>
        )}
      </div>
    </>
  );
};

export default VoiceInputOutput;
