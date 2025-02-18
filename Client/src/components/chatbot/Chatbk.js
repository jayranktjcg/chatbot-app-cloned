import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import axios from 'axios';


const Chatbk = () => {
  const messagesEndRef = useRef();
  const chatBoxRef = useRef(null);
  const inputRef = useRef();
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [audioFile, setAudioFile] = useState(null);

  const params = useParams();
  const navigate = useNavigate();

  useEffect(()=>{
    if(params?.chatId){
      getConversation(params?.chatId)
    }
  },[params])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (role, message, isBot, id, type) => {
    let accumulatedMessage = "";

    setMessages((prevMessages) => {

      // Check if last message is from the bot
      if (isBot && prevMessages.length > 0) {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage.isBot) {
          // Append to the last bot message without directly mutating it
          accumulatedMessage = lastMessage.message + message;
          return prevMessages.map((msg, index) =>
            index === prevMessages.length - 1
              ? { ...msg, message: accumulatedMessage, type, id }
              : msg
          );
        }
      }

      // Add a new message
      return [...prevMessages, { role, message, isBot, id, type }];
    });

    // Auto-scroll to the bottom
    setTimeout(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }, 100);
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    addMessage("user", userInput);

    setUserInput(""); // Clear the input field

    // Add an initial empty bot message for streaming updates
    addMessage("bot", "", true);

    console.log('userInput -->',userInput)

    let payload = {
      question : userInput
    }

    if(params?.chatId){
      payload["chat_id"] = params?.chatId
    }

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("https://classgpt.in/api/chats/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        addMessage("bot", "Error processing your request.");
        return;
      }

      if (response.body && response.body.getReader) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            break;
          };


          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');


          for (const line of lines) {
            if (line.trim()) {
              const parsed = JSON.parse(line);

              if (parsed.type === "Summary") {
                addMessage("bot", parsed.data, true, parsed.id, parsed.type);
              } else {
                if (parsed.message) {
                  if (parsed.message.type === "Mindmap") {
                    addMessage("bot", "Click here for Mindmap", true, parsed.id, parsed.message.type);
                  } else if (parsed.message.type === "Flashcard") {
                    addMessage("bot", "Click here for Flashcard", true, parsed.id, parsed.message.type);
                  } else {
                    addMessage("bot", "", true, parsed.id, "Summary");
                  }
                  if(!params?.chat_id){
                    
                    navigate(`/${parsed?.chat_id}`);
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      addMessage("bot", "Error processing your request.");
      console.error(error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const textToSpeech = async (text) => {
    try {

      const token = localStorage.getItem("authToken")
      // Send POST request to backend for TTS
      const response = await fetch("https://classgpt.in/api/chats/createAudio", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, },
        body: JSON.stringify({ input: text }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech.");
      }

      // Handle the audio stream
      const audioPlayer = document.getElementById("audioPlayer");
      const mediaSource = new MediaSource();

      audioPlayer.src = URL.createObjectURL(mediaSource);

      mediaSource.addEventListener("sourceopen", async () => {
        const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
        const reader = response.body.getReader();
        console.log(reader)

        const appendToBuffer = async () => {
          const { value, done } = await reader.read();
          console.log(value)

          if (value) {
            // Append data to the source buffer
            sourceBuffer.appendBuffer(value);
          }

          if (!done) {
            sourceBuffer.addEventListener("updateend", appendToBuffer, { once: true });
          } else {
            mediaSource.endOfStream();
          }
        };

        // Start appending data
        appendToBuffer();
      });

      // Play the audio
      audioPlayer.play();
    } catch (error) {
      console.error("Error in startStreaming:", error.message);
    }
  };


  const handleViewMap = (msg) => {

    if (msg?.type === "Flashcard" || msg?.intent === "Flashcard") {
      window.open(`https://classgpt.in/api/chats/view-FlashCard/${msg?.id}`, '_blank');
    }

    if (msg?.type === "Mindmap" || msg?.intent === "Mindmap") {
      window.open(`https://classgpt.in/api/chats/view-mindmap/${msg?.id}`, '_blank');
    }
  }

  const handleAudioChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file); // Set audio file URL
    }
  };

  const uploadAudio = async () => {
    if (!audioFile) {
      alert("Please select an audio file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", audioFile);

    try {

      const response = await fetch("https://classgpt.in/api/intent/audioToText", {
        method: "POST",
        body: formData,
      })

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let partialText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        partialText += chunk;
        setUserInput(partialText)
      }

    } catch (error) {
      console.error("Error uploading audio:", error);
      alert("An error occurred while uploading the audio.");
    }
  };

  const handleLikeOrDislike = async (id, type) => {

    // const token = localStorage.getItem('authToken')

    const token = localStorage.getItem("authToken")
    try {
      const response = await axios.patch(`https://classgpt.in/api/chats/react/${id}`,
        {
          reaction_status: type === "like" ? "like" : "dislike",
        },
        {
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, },
        }
      );
      if (response.status === 200) {
        updateMessageReaction(response.data?.data?.id, response.data?.data?.reaction_status);

      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const getConversation = async (chatId) => {

    try {
      const token = localStorage.getItem("authToken")
      const response = await axios.get(`https://classgpt.in/api/chats/historyDetails/${chatId}`,
        { 
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, },
        }
      );
      if (response.status === 200) {
        setMessages(response.data?.data?.details?.data)
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };


  const updateMessageReaction = (messageId, reactionStatus) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId
          ? { ...msg, isLiked: reactionStatus }
          : msg
      )
    );
  };

  const handleCopyClick = (message) => {
    navigator.clipboard.writeText(message).then(
      () => {
        alert("Message copied to clipboard!");
      },
      (err) => {
        console.error("Error copying message: ", err);
      }
    );
  };

  return (
    <div className="chatview" style={{ width: "100%" }}>
      <main className="chatview__chatarea" style={{ padding: "40px" }}>
        <audio id="audioPlayer" controls style={{ display: "none" }}>
          Your browser does not support the audio element.
        </audio>
        {messages.map((msg, index) => {
          return (
            <div style={{
              display: "flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              gap: "20px",
              maxWidth: "100%",
              margin: "10px 0px"
            }}>
              {msg.role === "user" ? (
                <ThumbDownIcon
                  size={25}
                  style={{ color: "green" }}
                />
              ) : (
                <ThumbDownIcon
                  size={25}
                  style={{ color: "black" }}
                />
              )}
              <div style={{ display: 'flex', flexDirection: "column", gap: "10px", maxWidth: "60%" }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: msg.role === "user" ? "right" : "left",
                    wordBreak: "break-all",
                    backgroundColor: msg.role === "user" ? "#4caf50" : "#e0e0e0",
                    padding: '1rem',
                    borderRadius: '10px',
                    color: msg.role === "user" ? '#fff' : '#000'
                  }}
                >
                  { (msg.intent != "Mindmap" ?? msg.intent != "Flashcard" ) ? msg.message : "view"}
                  {(msg.intent == "Mindmap" || msg.intent == "Flashcard") && msg?.role == "assistant" && (
                    <button
                      className="speech-button"
                      style={{
                        marginTop: "5px",
                        padding: "5px 10px",
                        backgroundColor: "#f0ad4e",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleViewMap(msg)}
                    >
                      view {msg.type || msg?.intent}
                    </button>
                  )}
                </div>
                {(msg.role === "bot" || msg.role === "assistant") && msg.message && (
                  <div style={{ display: "flex", gap: "18px" }}>
                    <ThumbDownIcon size={25} onClick={() => handleCopyClick(msg.message)} style={{ cursor: "pointer" }} />
                    {(msg?.isLiked === "like" || msg?.reaction_status === "like") ? <ThumbDownIcon size={25} /> : <ThumbDownIcon size={25} onClick={() => { handleLikeOrDislike(msg.id, "like") }} style={{ cursor: "pointer" }} />}
                    {(msg?.isLiked === "dislike" || msg?.reaction_status === "dislike") ? <ThumbDownIcon size={25} /> : <ThumbDownIcon size={25} onClick={() => { handleLikeOrDislike(msg.id, "dislike") }} style={{ cursor: "pointer" }} />}
                    <ThumbDownIcon size={25} />
                    <ThumbDownIcon
                      size={25}
                      onClick={() => textToSpeech(msg.message)}
                      style={{ cursor: "pointer" }}
                    />
                    <div
                      style={{
                        padding: "5px 10px",
                        borderRadius: "16px",
                        backgroundColor: "#e0e0e0",
                        color: "#333",
                        fontSize: "14px",
                        fontWeight: "500",
                        textAlign: "center",
                      }}
                    >
                      {msg.type || msg.intent}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <span ref={messagesEndRef}></span>
      </main>
      <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
        <textarea
          ref={inputRef}
          className="chatview__textarea-message"
          rows={1}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message here..."
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            resize: "none", // Prevent manual resizing
            overflow: "hidden", // Hide scrollbar for a cleaner look
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // Prevent default behavior of Enter key
              sendMessage(); // Trigger the sendMessage function
            }
          }}
          onInput={(e) => {
            e.target.style.height = "auto"; // Reset height to auto
            e.target.style.height = `${e.target.scrollHeight}px`; // Adjust height based on content
          }}
        />
        <button
          type="submit"
          // className="chatview__btn-send"
          onClick={sendMessage}
          style={{
            marginLeft: "10px",
            padding: "5px 10px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            // fontSize: "16px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <ThumbDownIcon size={25} />
        </button>
        <input
          type="file"
          id="audio-input"
          style={{ marginRight: "0px", marginLeft: "10px" }}

          onChange={handleAudioChange}
        // style={{ marginLeft: "10px" }}
        />
        <button
          onClick={uploadAudio}
          type="button"
          id="upload-button"
          style={{
            // marginLeft: "10px",  
            padding: "10px 20px",
            border: "none",
            backgroundColor: "#f0ad4e",
            color: "white",
            fontSize: "16px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Upload Audio
        </button>
      </div>
    </div>
  );
};

export default Chatbk;