import React, { useState, useEffect, useRef } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import Colors from "../../Helper/Colors";
import AiGPTLoader from "../../assets/icons/aiGPTLoader.gif";
import RecordingColors from "../../assets/recordingColors.svg";
import SpeekImageOne from "../../assets/speekImageOne.svg";
import SpeekImageTwo from "../../assets/speekImageTwo.svg";
import RecordActionBg from "../../assets/recordActionBg.svg";
import MuteAudio from "../../assets/icons/muteUnmuteAudio.svg";
import CloseIcon from "@mui/icons-material/Close";

const VoiceAssistant = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);

  const startSession = async () => {
    try {
      const response = await fetch("https://classgpt.in/api/chats/audio-to-audio");
      console.log(response)
      const data = await response.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      const pc = new RTCPeerConnection();

      audioElement.current = document.createElement("audio");
      audioElement.current.autoplay = true;
      pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      pc.addTrack(stream.getTracks()[0]);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch("https://classgpt.in/api/chats/audio-to-audio", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };

      await pc.setRemoteDescription(answer);
      peerConnection.current = pc;

      setIsSessionActive(true);
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  const stopSession = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    setIsSessionActive(false);
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
          sx={{
            backgroundColor: "#243547",
            width: "64px",
            height: "64px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: Colors.white,
            "&:hover": { backgroundColor: "#243547", opacity: "0.8" },
          }}
        >
          <img src={MuteAudio} alt="Mute" />
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
          sx={{
            backgroundColor: "#243547",
            width: "64px",
            height: "64px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: Colors.white,
            "&:hover": { backgroundColor: "#243547", opacity: "0.8" },
          }}
          onClick={stopSession}
        >
          <CloseIcon sx={{ width: "35px", height: "35px" }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default VoiceAssistant;