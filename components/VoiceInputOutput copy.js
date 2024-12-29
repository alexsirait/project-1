'use client';

import React, { useState, useEffect } from "react";
import Script from 'next/script';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { FaMicrophone, FaSpinner, FaCheck, FaStop, FaRocket } from "react-icons/fa";

const VoiceInputOutput = () => {
  const { transcript, resetTranscript } = useSpeechRecognition();
  const [response, setResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // New state for speaking
  const [textInput, setTextInput] = useState(""); // New state for manual input

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
        body: JSON.stringify({ prompt, user_id: "bonar12" }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      const cleanedResponse = data.response.replace(/[^\w\s.,?'"\-()!]/g, "");
      setResponse(cleanedResponse);
      handleResponsiveVoiceTTS(cleanedResponse);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Terjadi kesalahan saat menghubungi API.");
    }
  };

  const handleVoiceInteraction = async () => {
    setIsProcessing(true);
    handleStopListening();

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
      setIsSpeaking(false);
      alert("TechFusion Berhenti berbicara.");
    } else if (!isListening && !isProcessing) {
      handleStartListening();
    } else if (isListening) {
      handleVoiceInteraction();
    }
  };

  const handleManualSubmit = () => {
    if (textInput.trim()) {
      handleAskAPI(textInput);
      setTextInput("");
    } else {
      alert("Masukkan teks terlebih dahulu.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      {/* Avatar Section */}
      <div style={{ marginBottom: "20px" }}>
        <img
          src={isSpeaking ? "/ai-talking-avatar.gif" : "/ai-avatar.png"}
          alt="AI Avatar"
          style={{
            // width: "150px",
            // height: "150px",
            // borderRadius: "50%",
            // border: "2px solid #000",
          }}
        />
      </div>
      <Script src="https://code.responsivevoice.org/responsivevoice.js" strategy="beforeInteractive" />

      {/* Text Box and Microphone Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <div style={{ position: "relative", width: "60%" }}>
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Message TechFusion"
            style={{
              width: "100%",
              padding: "10px 40px 10px 10px", // Space for the rocket icon
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          />
          {/* Rocket Button */}
          <button
            onClick={handleManualSubmit}
            style={{
              position: "absolute",
              right: "5px",
              top: "50%",
              transform: "translateY(-50%)",
              padding: "5px 10px",
              fontSize: "16px",
              backgroundColor: "transparent",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            <FaRocket />
          </button>
        </div>
        {/* Microphone Button */}
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          style={{
            marginLeft: "10px", // Space from the text box
            padding: "10px 10px",
            fontSize: "16px",
            borderRadius: "50%",
            backgroundColor: isListening ? "#2196f3" : "#4caf50",
            color: "white",
            border: "none",
            cursor: "pointer",
            outline: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isListening ? <FaMicrophone /> : <FaMicrophone />}
        </button>
      </div>

      {/* Response Section */}
      {response && (
        <div
          style={{
            marginTop: "20px",
            fontSize: "18px",
            color: "#666", // Warna teks lebih redup
            // backgroundColor: "#f9f9f9", // Latar belakang yang lembut
            padding: "15px",
            borderRadius: "5px",
            // border: "1px solid #ddd", // Border tipis untuk pembatas
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Efek bayangan ringan
          }}
        >
          {/* <strong>Response:</strong> */}
          <p>{response}</p>
        </div>
      )}

    </div>
  );
};

export default VoiceInputOutput;
