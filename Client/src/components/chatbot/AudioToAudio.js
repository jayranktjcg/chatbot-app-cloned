import React, { useEffect, useRef, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import MuteAudio from "../../assets/icons/muteUnmuteAudio.svg";
import StopAudioSession from "../../assets/icons/stopAudioSession.svg";
import UnMuteAudio from "../../assets/icons/unmuteAudio.svg";
import AiGPTLoader from "../../assets/icons/aiGPTLoader.gif";
import RecordingColors from "../../assets/recordingColors.svg";
import SpeekImageOne from "../../assets/speekImageOne.svg";
import SpeekImageTwo from "../../assets/speekImageTwo.svg";
import RecordActionBg from "../../assets/recordActionBg.svg";
import Colors from "../../Helper/Colors";
import AppUtils from "../../Helper/AppUtils";
import UrlHelper from "../../Helper/Url";

const AudioToAudio = ({ onClose }) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const localAudioTrack = useRef(null);

  const toggleMute = () => {
    if (!localAudioTrack.current) {
      console.log("❌ No local audio track found. Make sure the session is started.");
      return;
    }
  
    const isEnabled = localAudioTrack.current.enabled;
    localAudioTrack.current.enabled = !isEnabled;
    setIsMuted(!isEnabled);
  
    if (peerConnection.current) {
      const senders = peerConnection.current.getSenders();
      const audioSender = senders.find((sender) => sender.track === localAudioTrack.current);
  
      if (audioSender) {
        audioSender.track.enabled = !isEnabled;
        console.log(isEnabled ? "🎤 Muting microphone." : "🎙️ Unmuting microphone.");
      } else {
        console.log("⚠️ Audio sender not found in peer connection.");
      }
    } else {
      console.log("⚠️ Peer connection is not active.");
    }
  };  
  
  useEffect(() => {
    startSession();
    return () => {
      stopSession();
    };
  }, []);

  let conversationHistory = [];

  const startSession = async () => {
    try {
      setIsLoading(true);
      const token = AppUtils.getLocalStorage("CHATBOT")?.token;
      const response = await fetch(`${UrlHelper.serverUrl}chats/audio/conversation`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      console.log("data :: ", data);
      console.log("data?.client_secret?.value :: ", data?.client_secret?.value);
  
      if (!data?.client_secret?.value) {
        throw new Error("Failed to retrieve client secret.");
      }
      const EPHEMERAL_KEY = data.client_secret.value;
      const pc = new RTCPeerConnection();
  
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
  
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
      };
  
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localAudioTrack.current = mediaStream.getAudioTracks()[0];
      const audioTrack = mediaStream.getTracks()[0];
      pc.addTrack(audioTrack);
  
      const dc = pc.createDataChannel("oai-events");
      dc.addEventListener("message", (e) => {
        try {
          const message = JSON.parse(e.data);
          if (message?.type === "response.done" && message?.response?.output?.[0]?.content?.[0]?.transcript) {
            const aiTranscript = message.response.output[0].content[0].transcript.trim();
            console.log("AI said:", aiTranscript);
            conversationHistory.push({role: 'assistant', message: aiTranscript});
          }
        } catch (error) {
          console.error("Error parsing AI response:", error);
        }  
      });
  
      const userRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      userRecognition.continuous = true;
      userRecognition.interimResults = true;
      userRecognition.lang = "en-US";
  
      userRecognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            let userMessage = event.results[i][0].transcript.trim();
            console.log("User said:", event.results[i][0].transcript.trim());
            conversationHistory.push({role: 'user', message: userMessage});
          }
        }
      };
  
      userRecognition.onerror = (event) => {
        console.error("User Speech Recognition Error:", event.error);
      };
  
      userRecognition.start();
  
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
  
      const sdpResponse = await fetch(
        "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
        {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${EPHEMERAL_KEY}`,
            "Content-Type": "application/sdp",
          },
        }
      );
  
      if (!sdpResponse.ok) {
        const errorData = await sdpResponse.json();
        throw new Error(errorData.message || "Failed to fetch SDP answer.");
      }
  
      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);
      peerConnection.current = pc;
      setIsSessionActive(true);
    } catch (error) {
      console.error("Error in startSession:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopSession = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setIsSessionActive(false);
    console.log("Full Conversation History:", JSON.stringify(conversationHistory, null, 2));
    conversationHistory = [];
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: Colors.black,
      }}
    >
      <Box
        sx={{
          height: "calc(100% - 95px)",
          position: "relative",
          width: "100%",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          borderRadius: "0 40px 40px 0",
        }}
      >
        {/* Animated Circle */}
        <Box
          sx={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            backgroundImage: `url(${AiGPTLoader})`,
            backgroundSize: "cover",
            marginTop: "20px",
          }}
        ></Box>

        {/* Gradient Background */}
        <Box
          sx={{
            width: "100%",
            height: "calc(100% - 150px)",
            backdropFilter: "blur(80px)",
            position: "absolute",
            bottom: "0",
            left: 0,
            borderRadius: "0 0 50px 50px",
            background: "linear-gradient(to top, #00000000, #00000030)",
            zIndex: "999",
          }}
        ></Box>
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "calc(100% - 150px)",
            display: "flex",
            overflowX: "clip",
          }}
        >
          <img
            src={RecordingColors}
            style={{
              position: "absolute",
              height: "calc(100% - 110px)",
              width: "100%",
              bottom: "-40px",
              left: "0",
            }}
          />
          <img
            src={SpeekImageTwo}
            style={{
              position: "absolute",
              height: "calc(100% - 150px)",
              width: "100%",
              bottom: "-40px",
              left: "0",
              animation: "moveLeftRight 7s linear infinite",
            }}
          />
          <img
            src={SpeekImageOne}
            style={{
              position: "absolute",
              height: "calc(100% - 150px)",
              width: "100%",
              bottom: "-40px",
              left: "0",
              animation: "moveRightLeft 7s linear infinite",
            }}
          />
          <style>
            {`
              @keyframes moveLeftRight {
                0% {
                  transform: translateX(-50%);
                }
                50% {
                  transform: translateX(50%);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
              @keyframes moveRightLeft {
                0% {
                  transform: translateX(50%);
                }
                50% {
                  transform: translateX(-50%);
                }
                100% {
                  transform: translateX(50%);
                }
              }
            `}
          </style>
        </Box>
      </Box>

      {/* Buttons */}
      <Box
        sx={{
          position: "absolute",
          bottom: "0",
          width: "95%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: `url(${RecordActionBg})`,
          backgroundPosition: "10px -200px",
          padding: "70px 20px 20px",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <IconButton
          onClick={toggleMute}
          sx={{
            backgroundColor: "#243547",
            width: "50px",
            height: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: Colors.white,
            p: 0,
            "&:hover": { backgroundColor: "#243547", opacity: "0.8" },
          }}
        >
          <img
            src={isMuted ? UnMuteAudio : MuteAudio}
            style={{ width: "100%", height: "100%" }}
          />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            color: Colors.white,
            fontSize: "1.5rem",
            fontWeight: 400,
            letterSpacing: "0.1rem",
            textAlign: "center",
          }}
        >
          Voice Chat
        </Typography>
        <IconButton
          onClick={() => {
            stopSession();
            onClose();
          }}
          sx={{
            backgroundColor: "#243547",
            width: "50px",
            height: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: Colors.white,
            p: 0,
            "&:hover": { backgroundColor: "#243547", opacity: "0.8" },
          }}
        >
          <img
            src={StopAudioSession}
            style={{ width: "100%", height: "100%" }}
          />
        </IconButton>
      </Box>
    </Box>
  );
};

export default AudioToAudio;
