import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import Colors from '../../Helper/Colors';
import HistoryBack from "../../assets/icons/historyBack.svg";
import SpeakerIcon from "../../assets/icons/speaker.svg";
import SpeakerIconWhite from "../../assets/icons/SpeakerIconWhite.svg";
import PauseIcon from "../../assets/icons/pauseIcon.svg";
import PauseIconWhite from "../../assets/icons/pauseIconWhite.svg";
import { getChatHistoryByMessageId } from '../../redux-store/Chat/ChatAction';
import AppUtils from '../../Helper/AppUtils';
import UrlHelper from '../../Helper/Url';

const FlashcardPage = () => {
  const navigate = useNavigate();
  const { id: messageId } = useParams();
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef(new Audio());
  const [flashCardData, setFlashCardData] = useState(null);
  const [flippedIndex, setFlippedIndex] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    const fetchFlashcardData = async () => {
      try {
        if (!messageId) {
          return;
        }
        const res = await getChatHistoryByMessageId(messageId);
        if (res.status === 200 && res.data) {
          const message = res.data;
          if (message && message.message) {
            try {
              const parsedMessage = JSON.parse(message.message);

              if (parsedMessage.type === "Flashcard") {
                setFlashCardData(parsedMessage.data);
              } else {
                console.error("Invalid flashcard format.");
              }
            } catch (error) {
              console.error("Error parsing JSON from message:", error);
            }
          } else {
            console.error("Message ID not found in chat history.");
          }
        } else {
          console.error("Invalid API response structure.");
        }
      } catch (error) {
        console.error("Error fetching flashcard data:", error);
      }
    };

    fetchFlashcardData();
  }, [messageId]);

  const handleFlip = (index) => {
    setFlippedIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  };

  const textToSpeech = async (text, messageId) => {
    try {
        const token = AppUtils.getLocalStorage("CHATBOT")?.token;

        if (playingMessageId === messageId) {
            if (isPlaying) {
                audioPlayerRef.current.pause();
                setIsPlaying(false);
            } else {
                audioPlayerRef.current.play();
                setIsPlaying(true);
            }
            return;
        }

        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
            audioPlayerRef.current.currentTime = 0;
        }

        const response = await fetch(`${UrlHelper.serverUrl}chats/text-to-audio`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ context: text }),
        });

        if (!response.ok) {
            throw new Error("Failed to generate speech.");
        }

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);

        audioPlayerRef.current.src = audioUrl;
        audioPlayerRef.current.load();

        setPlayingMessageId(messageId);
        setIsPlaying(true);
        audioPlayerRef.current.play();

        audioPlayerRef.current.onended = () => {
            setIsPlaying(false);
            setPlayingMessageId(null);
        };

    } catch (error) {
        console.error("Error in textToSpeech:", error.message);
    }
  };

  if (!flashCardData) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}>
        <Typography variant="body1" color="text.secondary">
          Loading flashcard data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      minHeight: 'calc(100vh - 48px)',
      padding: 3,
      backgroundColor: '#f5f5f5',
    }}>
      {/* Back Button */}
      <Box sx={{ position: 'fixed', left: 20, top: 20, zIndex: 9999 }}>
        <img
          src={HistoryBack}
          style={{ height: '40px', cursor: 'pointer' }}
          alt="Back"
          onClick={handleBack}
        />
      </Box>

      {/* Title */}
      <Typography sx={{
        fontSize: '1.2rem',
        fontWeight: '600',
        marginBottom: 2,
        textAlign: 'center',
        color: Colors.FlashCardAnswerColor,
        background: '#4AD4E3',
        padding: '15px 40px',
        borderRadius: '20px',
      }}>
        {flashCardData?.title || "Flashcards"}
      </Typography>

      {/* Flashcard List */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
        {flashCardData?.cards?.map((item, index) => (
          <Box
            key={index}
            onClick={() => handleFlip(index)}
            sx={{ perspective: '1000px', width: '260px', height: '200px', position: 'relative' }}
          >
            <Box sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              textAlign: 'center',
              transition: 'transform 0.6s',
              transformStyle: 'preserve-3d',
              transform: flippedIndex === index ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}>
              {/* Front Side */}
              <Box sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                backgroundColor: Colors.FlashCardQuestionColor,
                color: Colors.black,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '20px',
                boxShadow: 3,
              }}>
                <Box sx={{ position: 'absolute', right: 20, top: 20, zIndex: 9999 }}>
                  <img
                    src={playingMessageId === item.question && isPlaying ? PauseIcon : SpeakerIcon}
                    alt="Speaker Icon"
                    style={{ height: '25px', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      textToSpeech(item.question, item.question);
                    }}
                  />
                </Box>
                <Typography sx={{ padding: 3, fontSize: '1.3rem', fontWeight: 500 }}>
                  {item.question}
                </Typography>
              </Box>

              {/* Back Side */}
              <Box sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                backgroundColor: Colors.FlashCardAnswerColor,
                color: Colors.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '20px',
                boxShadow: 3,
                transform: 'rotateY(180deg)',
              }}>
                <Box sx={{ position: 'absolute', right: 20, top: 20, zIndex: 9999 }}>
                  <img
                    src={playingMessageId === item.answer && isPlaying ? PauseIconWhite : SpeakerIconWhite}
                    alt="Speaker Icon"
                    style={{ height: '25px', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      textToSpeech(item.answer, item.answer);
                    }}
                  />
                </Box>
                <Typography sx={{ padding: 2, fontWeight: 'bold' }}>
                  {item.answer}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      <audio id="audioPlayer" style={{ display: 'none' }}></audio>
    </Box>
  );
};

export default FlashcardPage;
