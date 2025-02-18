import { useState, useEffect } from "react";
import { Box, Typography, FormControl, RadioGroup, FormControlLabel, Radio, Button } from "@mui/material";

const QuickTestChat = ({ message }) => {
  const [questions, setQuestions] = useState([]);
  const [chatHistory, setChatHistory] = useState([]); // Stores past chat messages
  const [score, setScore] = useState(0);
  const [showScoreboard, setShowScoreboard] = useState(false);

  useEffect(() => {
    try {
        console.log("Raw QuickTest Message:", message); // Debugging log
        const parsedData = JSON.parse(message); // ✅ Use JSON.parse()
        console.log("Parsed QuickTest Data:", parsedData); // Log the output
        setQuestions(parsedData?.data || []); // Store parsed questions
    } catch (error) {
        console.error("Error parsing QuickTest message:", error);
    }
}, [message]);



  const handleOptionSelect = (selectedOption, questionIndex) => {
    if (chatHistory.some(chat => chat.questionIndex === questionIndex)) return; // Prevent duplicate selection

    const currentQuestion = questions[questionIndex];
    const isCorrect = selectedOption === currentQuestion.correct_answer;
    
    if (isCorrect) setScore(prevScore => prevScore + 1);

    const newChatEntries = [
      {
        type: "user",
        content: selectedOption, // User's selected option appears as a chat message
        questionIndex
      },
      {
        type: "assistant",
        content: isCorrect
          ? `✅ Correct! ${currentQuestion.explanation}`
          : `❌ Incorrect! The correct answer is "${currentQuestion.correct_answer}".\n\n${currentQuestion.explanation}`,
        isCorrect,
        questionIndex
      }
    ];

    setChatHistory(prev => [...prev, ...newChatEntries]); // Append messages

    // If it's the last question, show the scoreboard
    if (questionIndex === questions.length - 1) {
      setTimeout(() => setShowScoreboard(true), 1000);
    }
  };

  useEffect(() => {
    console.log("Updated Questions:", questions);
}, [questions]);

  return (
    <Box sx={{ maxWidth: "100%", width: "450px", mb: 1, display: "flex", flexDirection: "column" }}>
      {/* Render chat history */}
      {chatHistory.map((chat, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            justifyContent: chat.type === "user" ? "flex-end" : "flex-start",
            mt: 1
          }}
        >
          <Typography
            sx={{
              backgroundColor: chat.type === "user" ? "#DCF8C6" : "#E6F4FF",
              padding: "10px",
              borderRadius: "15px",
              maxWidth: "80%",
              fontWeight: "bold",
              textAlign: chat.type === "user" ? "right" : "left"
            }}
          >
            {chat.content}
          </Typography>
        </Box>
      ))}

      {/* Render unanswered questions */}
      {questions.map((question, index) => {
        if (chatHistory.some(chat => chat.questionIndex === index)) return null; // Skip answered questions

        return (
          <Box key={index} sx={{ mt: 3 }}>
            {/* Question Number */}
            <Typography sx={{ whiteSpace: "pre-wrap", fontWeight: "bold", color: "#666" }}>
              {`Question ${index + 1}/${questions.length}`}
            </Typography>

            {/* Question Text */}
            <Typography sx={{ whiteSpace: "pre-wrap", fontWeight: "bold", mt: 1 }}>
              {question.question}
            </Typography>

            {/* Answer Choices */}
            <FormControl component="fieldset" sx={{ width: "100%", mt: 2 }}>
              <RadioGroup
                value=""
                onChange={(event) => handleOptionSelect(event.target.value, index)}
                sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
              >
                {question.options.map((option, optionI) => (
                  <FormControlLabel
                    key={optionI}
                    value={option}
                    control={<Radio sx={{ "&.Mui-checked": { color: "#000" } }} />}
                    label={option}
                    sx={{
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      transition: "all 0.3s",
                      backgroundColor: "#fff",
                      "&:hover": { backgroundColor: "#f1f1f1" },
                      margin: 0,
                      width: "100%"
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        );
      })}

      {/* Scoreboard */}
      {showScoreboard && (
        <Box sx={{ mt: 3, p: 2, borderRadius: "10px", backgroundColor: "#E6F4FF", textAlign: "center" }}>
          <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>🎯 Scoreboard</Typography>
          <Typography sx={{ fontSize: "1rem", mt: 1 }}>
            You got <strong>{score}</strong> out of <strong>{questions.length}</strong> correct!
          </Typography>
          <Button
            sx={{ mt: 2, backgroundColor: "#007bff", color: "#fff", "&:hover": { backgroundColor: "#0056b3" } }}
            onClick={() => window.location.reload()} // Reset quiz
          >
            Restart Quiz
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default QuickTestChat;
