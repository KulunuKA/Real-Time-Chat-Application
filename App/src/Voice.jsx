import React, { useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const Voice = () => {
  const [detectedText, setDetectedText] = useState("");

  const { transcript, resetTranscript } = useSpeechRecognition();

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <div>Browser does not support Speech Recognition.</div>;
  }

  const handleSpeech = () => {
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });
  };

  const stopSpeech = () => {
    SpeechRecognition.stopListening();
    processTranscript(transcript);
    resetTranscript();
  };

  const processTranscript = (spokenWords) => {
    if (spokenWords.toLowerCase().includes("capital a")) {
      setDetectedText("A");
    } else {
      setDetectedText("Unrecognized command");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Voice Detection App</h1>
      <p>Say "Capital A" to display "A".</p>
      <button onClick={handleSpeech}>Start Listening</button>
      <button onClick={stopSpeech} style={{ marginLeft: "10px" }}>
        Stop Listening
      </button>
      <h2>Detected Text: {detectedText}</h2>
    </div>
  );
};

export default Voice;
