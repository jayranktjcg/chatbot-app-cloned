import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { Box, Button, Avatar, Typography, TextareaAutosize, IconButton, Dialog, DialogContent, DialogActions, Breadcrumbs, Link, Card, Grid, TextField, Checkbox, FormControlLabel } from '@mui/material';
import Colors from '../../Helper/Colors';
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { toast } from 'react-toastify'
import profileIcon from "../../assets/header-profile.png";
import AttachIcon from "../../assets/icons/attach.svg";
import CopyIcon from "../../assets/icons/copy.svg";
import PauseIcon from "../../assets/icons/pauseIcon.svg";
import DislikeIcon from "../../assets/icons/dislike.svg";
import ActiveDislikeIcon from "../../assets/icons/activeDislikeIcon.svg";
import ActiveLikeIcon from "../../assets/icons/activeLikeIcon.svg";
import LikeIcon from "../../assets/icons/like.svg";
import MicSoundIcon from "../../assets/icons/mic.svg";
import RefreshIcon from "../../assets/icons/refresh.svg";
import SendButtonIcon from "../../assets/icons/sendButton.svg";
import SpeakerIcon from "../../assets/icons/speaker.svg";
import RecordingColors from "../../assets/recordingColors.svg";
import SpeekImageOne from "../../assets/speekImageOne.svg";
import SpeekImageTwo from "../../assets/speekImageTwo.svg";
import RecordActionBg from "../../assets/recordActionBg.svg";
import LearnGpt from "../../assets/learnGpt.png";
import AiGPTLoader from "../../assets/icons/aiGPTLoader.gif";
import FileUploadIcon from "../../assets/icons/fileUploadIcon.svg";
import CircleCheck from "../../assets/icons/circleCheck.svg";
import TrashIcon from "../../assets/icons/trash.svg";
import SaveFileIcon from "../../assets/icons/saveFileIcon.svg";
import AddFolderIcon from "../../assets/icons/addFolderIcon.svg";
import MainCreateFolder from "../../assets/icons/mainCreateFolder.svg";
import FolderIcon from "../../assets/icons/FolderIcon.svg";
import HomeDirectory from "../../assets/icons/homeDirectory.svg";
import FolderCreateIcon from "../../assets/icons/folderCreateIcon.svg";
import ScrollToDown from "../../assets/icons/scrollToDownIcon.svg";
import GreatJobQuicResult from "../../assets/icons/greatJobQuicResult.svg";
import SparkleStars from "../../assets/icons/sparkleStars.svg";
import XClose from "../../assets/icons/XClose.svg";
import { fetchDirectoryList, createDirectory } from "../../redux-store/Directory/DirectoryAction";
import axios from 'axios';
import AppUtils from '../../Helper/AppUtils';
import UrlHelper from '../../Helper/Url';
import LoaderMessage from './LoaderMessage';
import { getChatHistory, getChatHistoryById, getChatHistoryByMessageId } from '../../redux-store/Chat/ChatAction';
import { useDropzone } from 'react-dropzone'
import SessionControls from '../audiocomponents/SessionControls';
import Markdown from './markdowncomponents/Markdown';
import PromptCardList from './PromptCardList';

const CreateFolderDialogContent = ({ open, onClose, folderData, folderName, setFolderName, error, handleSave }) => {
    return (
        <Dialog open={open} onClose={onClose} sx={{ '& .MuiDialog-paperWidthSm': { borderRadius: '20px', overflow: 'hidden', minWidth: '450px', width: '450px' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', m: '20px 20px 10px 20px' }}>
                <img src={FolderCreateIcon} alt="Add Folder" style={{ height: '50px', cursor: 'pointer' }} />
                <Button
                    onClick={onClose}
                    sx={{ backgroundColor: Colors.transparent, borderRadius: '50%', boxShadow: 'none', width: '30px', minWidth: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', "&:hover": { backgroundColor: Colors.transparent, color: Colors.white, boxShadow: 'none' } }}
                >
                    <img src={XClose} alt="Close" style={{ height: '25px', cursor: 'pointer' }} />
                </Button>
            </Box>
            <DialogContent sx={{ textAlign: 'start', display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0 }}>
                <Typography sx={{ textAlign: 'start', fontSize: '1.3rem', fontWeight: 600, color: Colors.black, width: '100%' }}>
                    {folderData ? `Rename “${folderName}”?` : "Create a New Folder"}
                </Typography>
                <Typography sx={{ textAlign: 'start', width: '100%', fontSize: '1rem', color: Colors.QuickTestQuestionColor, marginBottom: '10px' }}>
                    {folderData ? "" : "Create and save your folders for your notes"}
                </Typography>
                <Box sx={{ width: '100%', mb: '1.5rem' }}>
                    <Typography sx={{ color: Colors.black, fontWeight: 500, fontSize: '1.1rem', mb: '0.5rem', ml: '0' }}>Folder Name</Typography>
                    <TextField
                        variant="outlined"
                        fullWidth
                        placeholder='Enter Folder Name'
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        error={!!error}
                        helperText={error}
                        sx={{ '& .MuiOutlinedInput-notchedOutline': { borderRadius: '2rem', borderColor: `${Colors.InputBorderColor} !important` }, '& .MuiInputBase-input': { padding: '12px 18px' } }}
                    />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textTransform: 'capitalize',
                            px: 2,
                            py: 1,
                            width: '100%',
                            borderRadius: 50,
                            backgroundColor: Colors.black,
                            "&:hover": { backgroundColor: Colors.black, opacity: 0.8 },
                            fontSize: '1rem',
                            fontWeight: 500,
                        }}
                    >
                        {folderData ? "Update" : "Create"}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onClose}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textTransform: 'capitalize',
                            px: 2,
                            py: 1,
                            width: '100%',
                            borderRadius: 50,
                            color: Colors.black,
                            boxShadow: 'none',
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            borderColor: Colors.InputBorderColor,
                            backgroundColor: Colors.white,
                            "&:hover": { backgroundColor: Colors.white, opacity: 0.8, color: Colors.black, boxShadow: 'none' },
                            fontSize: '1rem',
                            fontWeight: 500,
                        }}
                    >
                        Cancel
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

const ChatBot = ({ message, open, onClose, item }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef();
    const [user, setUser] = useState(null);
    const [image, setImage] = useState(null);
    const location = useLocation();
    const { chat_id } = useParams();
    const [currentChatId, setCurrentChatId] = useState(chat_id || null);
    const queryParams = new URLSearchParams(location.search);
    const chatId = queryParams.get("chat_id");
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [transcription, setTranscription] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [showDialogSaveMessage, setShowDialogSaveMessage] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunks = useRef([]);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isLoadingResponse, setIsLoadingResponse] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [moveDirectories, setMoveDirectories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [moveBreadcrumbs, setMoveBreadcrumbs] = useState([{ name: "All", id: 0 }]);
    const [selectedMoveParentId, setSelectedMoveParentId] = useState(0);
    const [openCreateFolder, setOpenCreateFolder] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [fileName, setFileName] = useState("");
    const [error, setError] = useState("");
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const messagesContainerRef = useRef(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingMessageId, setPlayingMessageId] = useState(null);
    const audioPlayerRef = useRef(new Audio());
    const [preventScroll, setPreventScroll] = useState(false);
    const [testCompleted, setTestCompleted] = useState(false);
    const [isQuickTestActive, setIsQuickTestActive] = useState(false);
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [pendingEvent, setPendingEvent] = useState(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
        }
    };

    const handleChange = async (option, message, questionObject) => {
        if (currentQuestionIndex === 0) {
            setIsQuickTestActive(true);
            localStorage.setItem("isQuickTestActive", "true");
        }    
        setSelectedOptions((prev) => [...prev, option]);
        const messageArray = messages.map((msg) => {
            if (msg.id === message.id) {
                let parsedMessage;
                try {
                    parsedMessage = typeof msg.message === "string" ? JSON.parse(msg.message) : msg.message;
                } catch (error) {
                    return msg;
                }
                return {
                    ...msg,
                    message: JSON.stringify({ ...parsedMessage, user_answer: option, question_id: questionObject?.id })
                };
            }
            return msg;
        });
    
        setMessages(messageArray);
        addMessage('user', option, false, message?.id, "userAnswered", 'completed');
    
        try {
            const payload = {
                question_id: questionObject?.id || message?.id,
                selected_answer: option
            };
    
            const token = AppUtils.getLocalStorage("CHATBOT")?.token;
    
            const response = await fetch(`${UrlHelper.serverUrl}chats/answers/validate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
    
            const jsonResponse = await response.json();
            if (jsonResponse.status === 200 && jsonResponse.data) {
                if (message.intent === "QuickTest") {
                    const formattedMessage = jsonResponse.message + " " + jsonResponse.data.explanation;
                    addMessage('assistant', formattedMessage, true, `assistant_${Date.now()}`, 'quickExplanation', 'completed');
                }
            }
        } catch (error) {
            console.error("Error submitting answer:", error);
        }
    
        setTimeout(() => {
            handleNextOption(message);
        }, 1000);
    };    
    
    const handleNextOption = async (message) => {
        if (currentQuestionIndex < questions?.length - 1) {
            const nextQuestion = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextQuestion);
    
            const questionObject = {
                ...questions[nextQuestion],
                index: nextQuestion + 1,
                user_answer: '',
                message_id: message.id
            };
    
            const newMessageId = message?.id;
            const newQuestionId = `question_${questions[nextQuestion].id}`;
            addMessage('assistant', JSON.stringify({ ...questionObject, question_id: newQuestionId }), false, newMessageId, message?.intent, 'completed');
        } else {
            setIsQuickTestActive(false);
            setTestCompleted(true);
            localStorage.removeItem("isQuickTestActive");
    
            try {
                const token = AppUtils.getLocalStorage("CHATBOT")?.token;
                const response = await fetch(`${UrlHelper.serverUrl}chats/quiz/${message?.id}/results`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                });
    
                const jsonResponse = await response.json();
    
                if (jsonResponse.status === 200 && jsonResponse.data) {
                    let parsedQuizResult = jsonResponse.data;
                    if (!parsedQuizResult.quizData || !Array.isArray(parsedQuizResult.quizData)) {
                        addMessage("assistant", "Error processing test results.", true, `assistant_${Date.now()}`, "error", "completed");
                        return;
                    }
    
                    if (message.intent === "MCQGeneration") {
                        setMessages(prevMessages => {
                            return prevMessages.filter(msg => {
                                return msg.intent !== "MCQGeneration" && msg.intent !== "MCQQuestion" && msg.intent !== "userAnswered";
                            });
                        });
                        setQuestions([]);
                        setCurrentQuestionIndex(0);
                        const formattedResults = parsedQuizResult.quizData.map((q) => ({
                            question: q.question,
                            options: q.options,
                            user_answer: q.users_answer || "Not answered",
                            correct_answer: q.correct_answer,
                            is_correct: q.is_correct,
                            explanation: q.explanation || "No explanation provided."
                        }));
    
                        const finalMessage = {
                            ...parsedQuizResult,
                            detailed_results: formattedResults
                        };
                        setTimeout(() => {
                            addMessage(
                                "assistant",
                                JSON.stringify(finalMessage),
                                true,
                                `assistant_${Date.now()}`,
                                "MCQResult",
                                "completed"
                            );
                        }, 500);
                    } else {
                        addMessage(
                            "assistant",
                            JSON.stringify(parsedQuizResult),
                            true,
                            `assistant_${Date.now()}`,
                            "QuickTestResult",
                            "completed"
                        );
                    }
                    setIsQuickTestActive(false);
                } else {
                    addMessage("assistant", "Error retrieving test results.", true, `assistant_${Date.now()}`, "error", "completed");
                    setIsQuickTestActive(false);
                }
            } catch (error) {
                addMessage("assistant", "Error processing test results.", true, `assistant_${Date.now()}`, "error", "completed");
            }
        }
    };

    window.addEventListener("beforeunload", (event) => {
        const isTestActive = localStorage.getItem("isQuickTestActive");
        if (isTestActive) {
            event.preventDefault();
            setShowExitDialog(true);
        }
    });

    const handleCancelExit = () => {
        setShowExitDialog(false);
    };
    
    const handleStopQuickTest = async () => {
        setTestCompleted(true);
        setIsQuickTestActive(false);
        localStorage.removeItem("isQuickTestActive");
        try {
            const token = AppUtils.getLocalStorage("CHATBOT")?.token;
            const lastQuestionMessage = messages.find(msg => msg.intent === "QuickTest" || msg.intent === "MCQGeneration");
    
            if (!lastQuestionMessage) {
                return;
            }
    
            const response = await fetch(`${UrlHelper.serverUrl}chats/quiz/${lastQuestionMessage.id}/results`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });
    
            const jsonResponse = await response.json();
    
            if (jsonResponse.status === 200 && jsonResponse.data) {
                let parsedQuizResult = jsonResponse.data;
                if (!parsedQuizResult.quizData || !Array.isArray(parsedQuizResult.quizData)) {
                    addMessage("assistant", "Error processing test results.", true, `assistant_${Date.now()}`, "error", "completed");
                    return;
                }
                if (lastQuestionMessage.intent === "MCQGeneration") {
                    setMessages(prevMessages => {
                        return prevMessages.filter(msg => {
                            return msg.intent !== "MCQGeneration" && msg.intent !== "MCQQuestion" && msg.intent !== "userAnswered";
                        });
                    });
    
                    setQuestions([]);
                    setCurrentQuestionIndex(0);
                }
                const formattedResults = parsedQuizResult.quizData.map((q) => ({
                    question: q.question,
                    options: q.options,
                    user_answer: q.users_answer || "Not answered",
                    correct_answer: q.correct_answer,
                    is_correct: q.is_correct,
                    explanation: q.explanation || "No explanation provided."
                }));
    
                const finalMessage = {
                    ...parsedQuizResult,
                    detailed_results: formattedResults
                };
                setTimeout(() => {
                    addMessage(
                        "assistant",
                        JSON.stringify(finalMessage),
                        true,
                        `assistant_${Date.now()}`,
                        lastQuestionMessage.intent === "MCQGeneration" ? "MCQResult" : "QuickTestResult",
                        "completed"
                    );
                }, 500);
                setIsQuickTestActive(false);
            } else {
                addMessage("assistant", "Error retrieving test results.", true, `assistant_${Date.now()}`, "error", "completed");
                setIsQuickTestActive(false);
            }
        } catch (error) {
            addMessage("assistant", "Error processing test results.", true, `assistant_${Date.now()}`, "error", "completed");
        }
    };

    const handleSend = async () => {
        setImage(null);
        sendMessage(input)
        setInput('');
        scrollToBottom();
    };

    const addMessage = (role, message, isBot, id, type, status = "pending", image) => {
        setMessages((prevMessages) => {
            if (isBot) {
                const lastMessage = prevMessages[prevMessages.length - 1];
                if (lastMessage?.isBot && lastMessage?.status === "pending") {
                    return prevMessages.map((msg, index) =>
                        index === prevMessages.length - 1
                            ? {
                                ...msg,
                                message: lastMessage.message + message,
                                intent: type,
                                id: id || msg.id,
                                status,
                                data: type === "Mindmap" || type === "Flashcard" ? JSON.parse(message) : null
                            }
                            : msg
                    );
                }
            }

            return [
                ...prevMessages,
                { role, message, isBot, id, intent: type, status, image, isLiked: null, data: type === "Mindmap" || type === "Flashcard" ? JSON.parse(message) : null},
            ];
        });
    };

    const getChatHistoryData = async (chatId) => {
        try {
            const res = await getChatHistoryById(chatId);
    
            if (res.status === 200 && Array.isArray(res.data.messages)) {
                let newMessages = [];
                let unansweredQuestionIndex = -1;
                let questionsArray = [];
                let isQuizActive = false;
                let quizResult = null;

                res.data.messages.forEach((msg) => {
                    let intent = msg.intent || "Summary";
                    let messageContent = msg.message;
                    let parsedMessage = {};
    
                    try {
                        parsedMessage = typeof msg.message === "string" && msg.message.trim().startsWith("{") 
                            ? JSON.parse(msg.message) 
                            : msg.message;
                    } catch (error) {
                        console.error("Error parsing message:", error);
                    }
                    if (msg.quiz_result) {
                        quizResult = JSON.parse(msg.quiz_result);
                    }
    
                    if (parsedMessage?.type === "Quicktest") {
                        intent = "QuickTest";
                        questionsArray = msg.quizData || [];
                        setQuestions(questionsArray);
    
                        let foundUnanswered = false;
                        questionsArray.forEach((question, index) => {
                            if (foundUnanswered) return;
    
                            const questionObject = {
                                ...question,
                                index: index + 1,
                                user_answer: question?.user_answer || '',
                                question_id: `question_${question.id}`
                            };
    
                            if (!question?.user_answer && unansweredQuestionIndex === -1) {
                                unansweredQuestionIndex = index;
                                foundUnanswered = true;
                                isQuizActive = true;
                            }
    
                            newMessages.push({
                                id: msg.id,
                                role: "assistant",
                                isBot: true,
                                status: "completed",
                                intent: "QuickTest",
                                message: JSON.stringify(questionObject),
                                image: null,
                                isLiked: null,
                                isExplanation: false,
                            });
    
                            if (question?.user_answer) {
                                newMessages.push({
                                    id: msg.id,
                                    role: "user",
                                    isBot: false,
                                    status: "completed",
                                    intent: null,
                                    message: question.user_answer,
                                    image: null,
                                    isLiked: null,
                                    isExplanation: false,
                                });
    
                                if (question?.explanation) {
                                    newMessages.push({
                                        id: msg.id,
                                        role: "assistant",
                                        isBot: true,
                                        status: "completed",
                                        intent: "quicktTestExplanation",
                                        message: question.explanation,
                                        image: null,
                                        isLiked: null,
                                        isExplanation: true,
                                    });
                                }
                            }
                        });
                    }
    
                    if (parsedMessage?.type === "Quicktest") {
                        newMessages.push({
                            id: `quiz_result_${msg.id}`,
                            role: "assistant",
                            isBot: true,
                            status: "completed",
                            intent: "QuickTestResult",
                            message: JSON.stringify(quizResult),
                            image: null,
                            isLiked: null,
                            isExplanation: false,
                        });
                    } else if (parsedMessage?.type === "MCQ") {
                        intent = "MCQGeneration";
                        questionsArray = msg.quizData || [];
                        setQuestions(questionsArray);
                        if (questionsArray || quizResult) {
                            const formattedResults = questionsArray.map((q) => ({
                                question: q.question,
                                options: q.options,
                                user_answer: q.user_answer || "Not answered",
                                correct_answer: q.correct_answer,
                                is_correct: q.user_answer === q.correct_answer,
                                explanation: q.explanation || "No explanation provided."
                            }));
    
                            const finalMessage = {
                                ...quizResult,
                                detailed_results: formattedResults
                            };
    
                            newMessages.push({
                                id: msg.id,
                                role: "assistant",
                                isBot: true,
                                status: "completed",
                                intent: "MCQResult",
                                message: JSON.stringify(finalMessage),
                                image: null,
                                isLiked: null,
                                isExplanation: false,
                            });
                        } else {
                            messageContent = JSON.stringify({
                                ...questionsArray[currentQuestionIndex],
                                index: currentQuestionIndex + 1,
                                user_answer: questionsArray[currentQuestionIndex]?.user_answer || ''
                            });
    
                            newMessages.push({
                                ...msg,
                                isBot: msg.role === "assistant",
                                status: "completed",
                                intent: "MCQGeneration",
                                message: messageContent,
                                image: msg.files ? `${UrlHelper.mediaURL}chat_image/${msg.files}` : null,
                                isExplanation: false,
                            });
                        }
                    } 
                    else if (parsedMessage?.type === "Mindmap") {
                        intent = "Mindmap";
                        newMessages.push({
                            id: msg.id,
                            role: "assistant",
                            isBot: true,
                            status: "completed",
                            intent: "Mindmap",
                            message: JSON.stringify(parsedMessage),
                            image: null,
                            isLiked: null,
                            isExplanation: false,
                        });
                    } else if (parsedMessage?.type === "Flashcard") {
                        intent = "Flashcard";
                        newMessages.push({
                            id: msg.id,
                            role: "assistant",
                            isBot: true,
                            status: "completed",
                            intent: "Flashcard",
                            message: JSON.stringify(parsedMessage),
                            image: null,
                            isLiked: null,
                            isExplanation: false,
                        });
                    } else {
                        intent = parsedMessage?.type || "Summary";
                        messageContent = typeof parsedMessage === "object" ? JSON.stringify(parsedMessage) : msg.message;
    
                        newMessages.push({
                            ...msg,
                            isBot: msg.role === "assistant",
                            status: "completed",
                            isLiked: msg.reaction_status || null,
                            intent: intent,
                            message: messageContent,
                            image: msg.files ? `${UrlHelper.mediaURL}chat_image/${msg.files}` : null,
                            isExplanation: false,
                        });
                    }
                });
                setCurrentQuestionIndex(unansweredQuestionIndex !== -1 ? unansweredQuestionIndex : (questionsArray.length - 1));
                setMessages(newMessages);
                setIsQuickTestActive(false);
            }
        } catch (error) {
            console.error("Error fetching chat history:", error);
        }
    };

    useEffect(() => {
        if (chat_id) {
            setMessages([]);
            setIsQuickTestActive(false);
            setCurrentChatId(chat_id);
            getChatHistoryData(chat_id);
        } else {
            setMessages([]);
            setCurrentChatId(null);
            setIsQuickTestActive(false);
        }
    }, [chat_id]);

    const sendMessage = async (userInput, regeneratedResponseId = null) => {
        if (!userInput.trim() && !AppUtils.checkValue(image) && !regeneratedResponseId) return;
    
        let loaderId = regeneratedResponseId || '';
    
        if (regeneratedResponseId) {
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    role: "user",
                    message: userInput,
                    isBot: true,
                    id: regeneratedResponseId,
                    status: "completed",
                },
            ]);
        } else if (userInput.trim()) {
            addMessage("user", userInput, false, loaderId, null, "completed", AppUtils.checkValue(image) ? image : null);
            setInput("");
        }
    
        addMessage("assistant", "", true, loaderId, "loader");
    
        try {
            setIsLoadingResponse(true);
            const token = AppUtils.getLocalStorage("CHATBOT")?.token;
    
            let payload;
            let headers = {
                Authorization: `Bearer ${token}`,
            };
    
            if (AppUtils.checkValue(image)) {
                payload = new FormData();
                payload.append("question", userInput.trim());
                payload.append("chat_id", currentChatId || "");
                payload.append("file", image);
            } else {
                payload = JSON.stringify({
                    question: userInput.trim(),
                    chat_id: currentChatId || null,
                    regenerate_response_id: regeneratedResponseId,
                });
                headers["Content-Type"] = "application/json";
            }

            const response = await fetch(`${UrlHelper.serverUrl}chats/messages`, {
                method: "POST",
                headers,
                body: payload,
            });
    
            if (!response.ok) {
                if (!regeneratedResponseId) removeLoader(loaderId);
                addMessage("assistant", "Error processing your request.", true, null, "error", "completed");
                return;
            }
    
            if (response.body && response.body.getReader) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
    
                let chatIdSet = !!currentChatId;
                
                while (true) {
                    const { value, done } = await reader.read();
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");
    
                    for (const line of lines) {
                        if (line.trim()) {
                            const parsed = JSON.parse(line);
                            console.log("parsed >>>>>>>", parsed)
                            const extractedChatId = parsed.chat_id || parsed.data?.chat_id;
                            if (!chatIdSet && extractedChatId) {
                                const currentUrl = new URL(window.location.href);
                                currentUrl.pathname = `/chatbot/${extractedChatId}`;
                                window.history.pushState({}, "", currentUrl.toString());
                                setCurrentChatId(extractedChatId);
                                chatIdSet = true;
    
                                if (AppUtils.checkValue(extractedChatId)) {
                                    setTimeout(() => {
                                        getChatHistory({ page: 1, limit: 25 }, dispatch);
                                    }, 1000);
                                }
                            }

                            if (parsed.id) {
                                loaderId = parsed.id;
                                console.log(loaderId)
                            }

                            if (parsed.data?.intent === "MCQGeneration" || parsed.data?.intent === "QuickTest") {
                                setQuestions([]);
                                setCurrentQuestionIndex(0);
                            }
                            if (parsed.type === "Summary") {
                                addMessage("assistant", parsed.data, true, done ? loaderId : null, parsed.type, done ? "completed" : "pending");
                            } else if (AppUtils.checkValue(parsed.data) && Object.keys(parsed.data).length > 0) {
                                const intent = parsed.data.intent;
                                if (intent === "Mindmap") {
                                    addMessage("assistant", JSON.stringify(parsed.data.message), true, parsed.data.id, intent, done ? "completed" : "pending");
                                } else if (intent === "Flashcard") {
                                    addMessage("assistant", JSON.stringify(parsed.data.message), true, parsed.data.id, intent, done ? "completed" : "pending");
                                } else if (intent === "QuickTest") {
                                    const questionsArray = parsed?.data?.quizData
                                    const questionObject = {
                                        ...questionsArray[0],
                                        index: 1,
                                        user_answer: '',
                                        message_id: parsed?.data?.id
                                    }
                                    setQuestions(questionsArray)
                                    addMessage("assistant", JSON.stringify(questionObject), true, parsed?.data?.id, intent, done ? "completed" : "pending");
                                } else if (intent === "MCQGeneration") {
                                    const questionsArray = parsed?.data?.quizData
                                    const questionObject = {
                                        ...questionsArray[0],
                                        index: 1,
                                        user_answer: '',
                                        message_id: parsed?.data?.id
                                    }
                                    setQuestions(questionsArray)
                                    addMessage("assistant", JSON.stringify(questionObject), true, parsed?.data?.id, intent, done ? "completed" : "pending");
                                } else {
                                    addMessage("assistant", "", true, parsed.id, "Summary", done ? "completed" : "pending");
                                }
                            }
                        }
                    }
    
                    if (done) {
                        setMessages((prevMessages) => {
                            const updatedMessages = [...prevMessages];
                            const lastIndex = updatedMessages.length - 1;
                            if (updatedMessages[lastIndex]) {
                                updatedMessages[lastIndex].status = "completed";
                                if (updatedMessages[lastIndex].intent === "Summary") {
                                    updatedMessages[lastIndex].id = loaderId;
                                }
                            }
                            return updatedMessages;
                        });
                        break;
                    }
                }
            }
        } catch (error) {
            if (!regeneratedResponseId) removeLoader(loaderId);
            addMessage("assistant", "Error processing your request.", true, null, "error", "completed");
            console.error(error);
        } finally {
            setIsLoadingResponse(false);
        }
    };

    const handleRefreshClick = (message, messages, setMessages, sendMessage) => {
        const questionIndex = messages.findIndex((msg) => msg.id === message.id);
        if (questionIndex > -1) {
            const refreshedQuestion = messages[questionIndex - 1]?.message;

            if (refreshedQuestion) {
                const regeneratedResponseId = message.id;
                const updatedMessages = messages.filter((_, index) => index !== questionIndex && index !== questionIndex - 1);
                setMessages(updatedMessages);
                sendMessage(refreshedQuestion, regeneratedResponseId);
            }
        }
    };
    
    const removeLoader = (loaderId) => {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== loaderId));
    };

    const MyDropzone = () => {
        const { getRootProps, getInputProps } = useDropzone({
            multiple: false,
            maxSize: 10485760,
            disabled: Array.isArray(questions) && questions?.length > 0,
            accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
            onDrop: (acceptedFiles) => {
                acceptedFiles?.map((file) => setImage(file))
            }
        })

        return (
            <Box {...getRootProps()}>
                <input {...getInputProps()} />
                <IconButton
                    sx={{ bgcolor: Colors.iconButtonBg, p: 1.3 }}
                    disabled={Array.isArray(questions) && questions?.length > 0}
                >
                    <img
                        src={AttachIcon}
                        style={{ height: { xs: '15px', md: '20px' } }}
                    />
                </IconButton>
            </Box>
        )
    }

    const textToSpeech = async (text, messageId) => {
        try {
            const token = AppUtils.getLocalStorage("CHATBOT")?.token;
            
            if (audioPlayerRef.current && playingMessageId !== messageId) {
                audioPlayerRef.current.pause();
                audioPlayerRef.current.currentTime = 0;
                setPlayingMessageId(null);
                setIsPlaying(false);
            }
            if (playingMessageId === messageId && isPlaying) {
                audioPlayerRef.current.pause();
                setIsPlaying(false);
                return;
            } else if (playingMessageId === messageId && !isPlaying) {
                audioPlayerRef.current.play();
                setIsPlaying(true);
                return;
            }
    
            const response = await fetch(`${UrlHelper.serverUrl}chats/audio/text-to-speech`, {
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
    
            // Set new audio source
            audioPlayerRef.current.src = audioUrl;
            audioPlayerRef.current.load();
            setPlayingMessageId(messageId);
            setIsPlaying(true);
    
            // Play audio
            audioPlayerRef.current.play();
    
            // Handle when audio ends
            audioPlayerRef.current.onended = () => {
                setIsPlaying(false);
                setPlayingMessageId(null);
            };
    
        } catch (error) {
            console.error("Error in textToSpeech:", error.message);
        }
    };    

    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                mediaRecorder.start();
                setIsRecording(true);
                setShowDialog(true);

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.current.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
                    setAudioBlob(audioBlob);
                    audioChunks.current = [];
                };
            })
            .catch((error) => {
                toast.error("Error accessing microphone:", error);
            });
    };

    const handleStopAndSubmit = async () => {
        if (!mediaRecorderRef.current) {
            toast.error("No recording session found.");
            return;
        }
        const waitForAudioBlob = new Promise((resolve, reject) => {
            mediaRecorderRef.current.onstop = () => {
                setIsRecording(false);

                if (audioChunks.current.length === 0) {
                    reject(new Error("No audio recorded. Please record audio first."));
                }

                const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
                setAudioBlob(audioBlob);
                audioChunks.current = [];
                resolve(audioBlob);
            };

            mediaRecorderRef.current.stop();
        });

        try {
            const audioBlob = await waitForAudioBlob;

            const formData = new FormData();
            formData.append("audio", audioBlob, `recording.${audioBlob.type.split("/")[1] || "webm"}`);
            const token = AppUtils.getLocalStorage("CHATBOT")?.token;
            const response = await fetch(`${UrlHelper.serverUrl}chats/audio-to-text`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let partialText = "";

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    partialText += chunk;
                }

                const parsedResponse = JSON.parse(partialText);
                const transcriptionText = parsedResponse?.data?.text;

                if (transcriptionText) {
                    setInput(transcriptionText);
                }

                setShowDialog(false);
            } else {
                const errorDetails = await response.text();
                toast.error(`Error: ${response.statusText}. Details: ${errorDetails}`);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDialogClose = () => {
        setShowDialog(false);
        try {
            const parsedTranscription = JSON.parse(transcription);
            if (parsedTranscription?.data?.text) {
                setInput(parsedTranscription.data.text);
            } else {
            }
        } catch (error) {
        }
    };

    const handleOpenSaveFileDialog = (message) => {
        setShowDialogSaveMessage(true);
        setFileName("");
        setSelectedMessageId(message?.id || null);
    };

    const handelSaveMessageDialogClose = () => {
        setShowDialogSaveMessage(false)
    }

    const fetchMoveDirectories = async (newParentId = 0) => {
        const res = await fetchDirectoryList(newParentId, dispatch, "modal");
        if (res?.status === 200) {
            setMoveDirectories(res.data);
        }
    };

    useEffect(() => {
        if (showDialogSaveMessage) {
            fetchMoveDirectories(0);
        }
    }, [showDialogSaveMessage]);

    const handleMoveFolderClick = (folder) => {
        setMoveBreadcrumbs([...moveBreadcrumbs, { name: folder.name, id: folder.id }]);
        setSelectedMoveParentId(folder.id);
        fetchMoveDirectories(folder.id);
    };

    const handleMoveBreadcrumbClick = (index) => {
        const newBreadcrumbs = moveBreadcrumbs.slice(0, index + 1);
        setMoveBreadcrumbs(newBreadcrumbs);
        setSelectedMoveParentId(newBreadcrumbs[newBreadcrumbs.length - 1]?.id);
        fetchMoveDirectories(newBreadcrumbs[newBreadcrumbs.length - 1]?.id);
    };

    const handleSaveFile = async () => {
        if (!fileName.trim()) {
            setError("File name is required");
            return;
        }
        setError("");

        if (!selectedMessageId) {
            setError("Message ID is missing");
            return;
        }

        const payload = {
            name: fileName,
            parentId: selectedMoveParentId,
            type: "file",
            messageId: selectedMessageId,
        };

        const response = await createDirectory(payload, dispatch);

        if (response?.status === 201) {
            fetchMoveDirectories(selectedMoveParentId);
            setShowDialogSaveMessage(false);
        } else {
            setError(response?.message || "Something went wrong");
        }
    };

    const handleSaveFolder = async () => {
        if (!folderName.trim()) {
            setError("Folder name is required");
            return;
        }
        setError("");

        const payload = {
            name: folderName,
            parentId: selectedMoveParentId,
            type: "directory"
        };

        const response = await createDirectory(payload, dispatch);

        if (response?.status === 201) {
            fetchMoveDirectories(selectedMoveParentId);
            setOpenCreateFolder(false);
        } else {
            setError(response?.message || "Something went wrong");
        }
    };

    const handleCopyClick = (message) => {
        navigator.clipboard.writeText(message).then(
            () => {
                toast.success('Message copied to clipboard!');
            },
            (err) => {
                toast.error('Error copying message: ', err);
            }
        );
    };

    const handleLikeOrDislike = async (id, type) => {
        setPreventScroll(true);
        const token = AppUtils.getLocalStorage("CHATBOT")?.token;
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === id
                    ? { ...msg, isLiked: msg.isLiked === type ? null : type }
                    : msg
            )
        );

        try {
            const response = await axios.patch(
                `${UrlHelper.serverUrl}chats/messages/${id}/reaction`,
                { reaction_status: type },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                const updatedReaction = response.data?.data?.reaction_status;

                setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.id === id
                            ? { ...msg, isLiked: updatedReaction }
                            : msg
                    )
                );

                toast.success(
                    updatedReaction
                        ? `You ${updatedReaction === "like" ? "liked" : "disliked"} the message!`
                        : "Reaction removed"
                );
            }
        } catch (error) {
            console.error("Error updating reaction:", error);
            toast.error("Failed to update reaction. Please try again.");

            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === id
                        ? { ...msg, isLiked: null }
                        : msg
                )
            );
        }
    };
    
    const startSession = () => {
        console.log("Starting session...");
        setIsSessionActive(true);
    };

    const stopSession = () => {
        console.log("Stopping session...");
        setIsSessionActive(false);
    };

    useEffect(() => {
        const token = AppUtils.getLocalStorage("CHATBOT")?.token;
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (error) {
                localStorage.removeItem("authToken");
            }
        }
    }, []);

    useEffect(() => {
        if (!preventScroll) {
            scrollToBottom();
        }
    }, [messages]);


    return (
        <Box
            sx={{
                height: 'calc(100vh - 100px)',
                width: '100%',
                position: 'relative !important',
                overflow: 'hidden',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: AppUtils.checkValue(messages) ? 'center' : 'flex-start',
                alignItems: AppUtils.checkValue(messages) ? 'center' : 'stretch',
                '&::-webkit-scrollbar': { display: 'none' },
            }}
        >
            <audio id="audioPlayer" controls style={{ display: 'none' }}></audio>
            {messages.length === 0 ? (
                <>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: '600', color: Colors.black }}>
                        Hello {user ? `${user.first_name} ${user.last_name}` : "Profile"} 👋
                    </Typography>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: '600', color: Colors.black }}>
                        What would you like to do today?
                    </Typography>
                    <PromptCardList messages={messages} />
                </>
            ) : (
                <>
                    {showExitDialog && (
                        <Dialog open={showExitDialog} onClose={handleCancelExit} sx={{'& .MuiDialog-paperWidthSm' : {borderRadius: '20px', overflow: 'hidden', minWidth: '450px', width: '450px'}}}>
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', m: '20px 20px 10px 20px'}}>
                                <img src={profileIcon} alt="Add Folder" style={{ height: '70px', cursor: 'pointer' }} />
                                <Button
                                onClick={handleCancelExit}
                                sx={{backgroundColor: Colors.transparent, borderRadius: '50%', boxShadow: 'none',
                                    width: '30px', minWidth: '30px', height: '30px', 
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', "&:hover": { backgroundColor: Colors.transparent, color: Colors.white, boxShadow: 'none', } 
                                }}
                                >
                                <img src={XClose} alt="Add Folder" style={{ height: '25px', cursor: 'pointer' }} />
                                </Button>
                            </Box>
                            <DialogContent sx={{ textAlign: 'start', display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0}}>
                                <Typography sx={{ textAlign: 'start', fontSize: '1.3rem', fontWeight: 600, color: Colors.black, width: '100%' }}>
                                Delete “Folder Name”?
                                </Typography>
                                <Typography sx={{ textAlign: 'start', fontSize: '1rem', color: Colors.QuickTestQuestionColor, marginBottom: '10px' }}>
                                Are you sure you want to delete this folder? This action cannot be undone.
                                </Typography>
                                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%'}}>
                                <Button
                                    variant="contained"
                                    onClick={async () => {
                                        await handleStopQuickTest();
                                        setShowExitDialog(false);
                                        localStorage.removeItem("isQuickTestActive");
                                    }}                                
                                    sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textTransform: 'capitalize',
                                    px: 2,
                                    py: 1,
                                    width: '100%',
                                    borderRadius: 50,
                                    backgroundColor: Colors.RedColor,
                                    boxShadow: 'none',
                                    "&:hover": { backgroundColor: Colors.RedColor, opacity: 0.8, boxShadow: 'none', },
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    }}
                                >
                                    Stop Exam
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleCancelExit}
                                    sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textTransform: 'capitalize',
                                    px: 2,
                                    py: 1,
                                    width: '100%',
                                    borderRadius: 50,
                                    color: Colors.black,
                                    boxShadow: 'none',
                                    borderStyle: 'solid',
                                    borderWidth: '1px',
                                    borderColor: Colors.InputBorderColor,
                                    backgroundColor: Colors.white,
                                    "&:hover": { backgroundColor: Colors.white, opacity: 0.8, color: Colors.black, boxShadow: 'none', },
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    }}
                                >
                                    Continue
                                </Button>
                                </Box>
                            </DialogContent>
                            </Dialog>
                    )}
                    {AppUtils.checkValue(messages) && messages?.length > 0 && (
                        <Box
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            sx={{
                                flex: 1,
                                position: 'relative',
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                width: '100%',
                                '&::-webkit-scrollbar': { display: 'none' },
                            }}
                        >
                            {messages?.map((message, index) => {
                                const questionObject = message?.intent === "QuickTest" || message?.intent === "MCQGeneration" ?  JSON.parse(message?.message) : {};
                                const optionsArray = questionObject?.options || [];
                                let quizResult = null;
                                try {
                                    quizResult = (message?.intent === "QuickTestResult" || message?.intent === "MCQResult")
                                        ? JSON.parse(message?.message)
                                        : null;
                                } catch (error) {
                                    console.error("Error Parsing Quiz Result:", error);
                                }
                                const mindmapData = message?.intent === "Mindmap" ? JSON.parse(message?.message) : {};
                                const flashcardData = message?.intent === "Flashcard" ? JSON.parse(message?.message) : {};
                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: message?.role === 'user' ? 'flex-end' : 'flex-start',
                                            gap: '8px',
                                            marginBottom: '10px',
                                            width: message?.role === "assistant" ? '60%' : 'unset',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'start', gap: '8px', position: 'relative', flexDirection: message?.role === 'user' ? 'row-reverse' : '', maxWidth: '100%' }}>
                                            {message?.role === 'assistant' ? (
                                                <img
                                                    src={LearnGpt}
                                                    style={{
                                                        width: '30px',
                                                        height: '30px',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            ) : (
                                                <>
                                                    {user ? (
                                                        <Avatar sx={{ backgroundColor: Colors.orange }} src={user.profile_picture}></Avatar>
                                                    ) : (
                                                        <Avatar sx={{ backgroundColor: Colors.orange }} src={profileIcon}></Avatar>
                                                    )}
                                                </>
                                            )}
                                            <Box
                                                className="messageBoxWrap"
                                                sx={{
                                                    backgroundColor:
                                                        message?.role === 'user'
                                                            ? Colors.white
                                                            : message?.intent === 'loader'
                                                                ? Colors.white
                                                                : Colors.AiBgColor,
                                                    color: Colors.black,
                                                    border: message?.role === 'user' ? Colors.borderUserMessage : '',
                                                    borderRadius:
                                                        message?.role === 'user'
                                                            ? '20px'
                                                            : message?.intent === 'loader'
                                                                ? '50px'
                                                                : '0 20px 20px 20px',
                                                    padding: message?.intent === 'loader' ? '0' : '12px 12px',
                                                    width: message?.intent === 'quicktTestExplanation' ? '450px' : '100%',
                                                    // maxWidth:
                                                    //     message?.role === "user"
                                                    //         ? '60%'
                                                    //         : !["Flashcard", "Mindmap", "QuickTest"].includes(message?.intent)
                                                    //             ? '100%'
                                                    //             : '60%',
                                                    // minWidth:
                                                    //     message?.role === "user"
                                                    //         ? 'unset'
                                                    //         : !["Flashcard", "Mindmap", "QuickTest", "loader"].includes(message?.intent)
                                                    //             ? '100%'
                                                    //             : 'unset',
                                                    wordBreak: 'break-word',
                                                    overflow: 'hidden',
                                                    display: 'block'
                                                }}
                                            >
                                                {AppUtils.checkValue(message?.image) && (
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            gap: 1,
                                                            flexWrap: 'wrap',
                                                        }}
                                                    >
                                                        <img
                                                            src={
                                                                message?.image instanceof Blob
                                                                    ? URL.createObjectURL(message?.image)
                                                                    : message?.image
                                                            }
                                                            style={{
                                                                width: '100px',
                                                                height: '100px',
                                                                objectFit: 'cover',
                                                                borderRadius: '8px',
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                                {message?.intent === "loader" ? (
                                                    <LoaderMessage />
                                                ) : message?.intent === "Mindmap" ? (
                                                    <Box sx={{ maxWidth: '450px', mb: 1 }}>
                                                        <Typography
                                                            sx={{ whiteSpace: 'pre-wrap' }}
                                                        >
                                                            {mindmapData?.data?.description || "I have generated an engaging mind map for 'Respiration in Humans.' This will include key concepts like the types of respiration, the role of lungs, and how oxygen is transported in the body."}
                                                        </Typography>
                                                        <Typography
                                                            sx={{ whiteSpace: 'pre-wrap', my: '16px !important' }}
                                                        >
                                                            Here's your file!
                                                        </Typography>
                                                        <Box
                                                            sx={{ border: Colors.FlashCardBorderColor, p: 1.5, background: Colors.white, borderRadius: '15px', cursor: 'pointer' }}
                                                            onClick={() => {
                                                                const url = `/mindmap/${message?.id}`;
                                                                window.open(url, "_blank");
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                                                                <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', gap: 2 }}>
                                                                    <img
                                                                        src={FileUploadIcon}
                                                                        style={{
                                                                            height: '35px', cursor: 'pointer',
                                                                        }}
                                                                        onClick={() => handleCopyClick(message?.message)}
                                                                    />
                                                                    <Box>
                                                                        <Typography>{mindmapData?.data?.title || "Mindmap"}</Typography>
                                                                        {/* <Typography>200 KB</Typography> */}
                                                                    </Box>
                                                                </Box>
                                                                <img
                                                                    src={CircleCheck}
                                                                    style={{
                                                                        height: '20px', cursor: 'pointer',
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                ) : message?.intent === "Flashcard" ? (
                                                    <Box sx={{ maxWidth: '450px', mb: 1 }}>
                                                        <Typography
                                                            sx={{ whiteSpace: 'pre-wrap' }}
                                                        >
                                                            {flashcardData?.data?.description || "Flashcards are a fantastic way to learn! I'll create flashcards highlighting the major events, key figures, and important dates from 'The French Revolution.'"}
                                                        </Typography>
                                                        <Typography
                                                            sx={{ whiteSpace: 'pre-wrap', my: "16px !important" }}
                                                        >
                                                            Here's your file!
                                                        </Typography>
                                                        <Box
                                                            sx={{ border: Colors.FlashCardBorderColor, p: 1.5, background: Colors.white, borderRadius: '15px', cursor: 'pointer' }}
                                                            onClick={() => {
                                                                const url = `/flashcard/${message.id}`;
                                                                window.open(url, "_blank");
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                                                                <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', gap: 2 }}>
                                                                    <img
                                                                        src={FileUploadIcon}
                                                                        style={{
                                                                            height: '35px', cursor: 'pointer',
                                                                        }}
                                                                        onClick={() => handleCopyClick(message?.message)}
                                                                    />
                                                                    <Box>
                                                                        <Typography>{flashcardData?.data?.title || "Flashcard"}</Typography>
                                                                        {/* <Typography>200 KB</Typography> */}
                                                                    </Box>
                                                                </Box>
                                                                <img
                                                                    src={CircleCheck}
                                                                    style={{
                                                                        height: '20px', cursor: 'pointer',
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                ) : message?.intent === "QuickTest" ? (
                                                    <Box sx={{ maxWidth: '100%', width: '450px', mb: 1 }}>
                                                        <Typography
                                                            sx={{ whiteSpace: 'pre-wrap', color: Colors.QuickTestQuestionColor }}
                                                        >
                                                            Question {questionObject?.index}/{questions?.length}
                                                        </Typography>
                                                        <Box>
                                                            {Array.isArray(questions) && questions?.length > 0 && (
                                                                <Box>
                                                                    <Typography sx={{ whiteSpace: 'pre-wrap', my: '0.5rem !important' }}>
                                                                        {questionObject?.question}
                                                                    </Typography>
                                                                    <Box>
                                                                        {Array.isArray(optionsArray) &&
                                                                            optionsArray.map((option, optionI) => {
                                                                                const isSelected = questionObject?.user_answer === option;
                                                                                const isTestCompleted = messages.some(
                                                                                    (msg) =>
                                                                                        (msg.intent === "QuickTestResult") &&
                                                                                        msg.message.includes(questionObject?.question)
                                                                                );
                                                                                return (
                                                                                    <FormControlLabel
                                                                                        key={optionI}
                                                                                        disabled={!!questionObject?.user_answer || isTestCompleted }
                                                                                        control={
                                                                                            <Checkbox
                                                                                                sx={{
                                                                                                    '&.Mui-checked': { color: '#000' },
                                                                                                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
                                                                                                }}
                                                                                                checked={isSelected}
                                                                                                onChange={() => handleChange(option, message, questionObject)}
                                                                                            />
                                                                                        }
                                                                                        label={option}
                                                                                        sx={{
                                                                                            border: selectedOptions?.includes(option) ? '1px solid #000' : '1px solid #ddd',
                                                                                            borderRadius: '15px',
                                                                                            px: 2,
                                                                                            py: 0.8,
                                                                                            transition: 'all 0.3s',
                                                                                            backgroundColor: selectedOptions?.includes(option) ? '#f9f9f9' : '#fff',
                                                                                            '&:hover': { backgroundColor: '#f1f1f1' },
                                                                                            margin: 0,
                                                                                            display: 'flex',
                                                                                            justifyContent: 'space-between',
                                                                                            flexDirection: 'row-reverse',
                                                                                            width: '-webkit-fill-available',
                                                                                            mb: 2
                                                                                        }}
                                                                                    />
                                                                                )
                                                                            }
                                                                            )}
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                ) : message?.intent === "MCQGeneration" ? (
                                                    <Box sx={{ maxWidth: '100%', width: '450px', mb: 1 }}>
                                                        <Typography
                                                            sx={{ whiteSpace: 'pre-wrap', color: Colors.QuickTestQuestionColor }}
                                                        >
                                                            Question {questionObject?.index}/{questions?.length}
                                                        </Typography>
                                                        <Box>
                                                            {Array.isArray(questions) && questions?.length > 0 && (
                                                                <Box>
                                                                    <Typography sx={{ whiteSpace: 'pre-wrap', my: '0.5rem !important' }}>
                                                                        {questionObject?.question}
                                                                    </Typography>
                                                                    <Box>
                                                                        {Array.isArray(optionsArray) &&
                                                                            optionsArray.map((option, optionI) => {
                                                                                return (
                                                                                    <FormControlLabel
                                                                                        key={optionI}
                                                                                        disabled={AppUtils.checkValue(questionObject?.user_answer)}
                                                                                        control={
                                                                                            <Checkbox
                                                                                                sx={{
                                                                                                    '&.Mui-checked': { color: '#000' },
                                                                                                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
                                                                                                }}
                                                                                                checked={selectedOptions?.includes(option)}
                                                                                                onChange={() => handleChange(option, message, questionObject)}
                                                                                            />
                                                                                        }
                                                                                        label={option}
                                                                                        sx={{
                                                                                            border: selectedOptions?.includes(option) ? '1px solid #000' : '1px solid #ddd',
                                                                                            borderRadius: '15px',
                                                                                            px: 2,
                                                                                            py: 0.8,
                                                                                            transition: 'all 0.3s',
                                                                                            backgroundColor: selectedOptions?.includes(option) ? '#f9f9f9' : '#fff',
                                                                                            '&:hover': { backgroundColor: '#f1f1f1' },
                                                                                            margin: 0,
                                                                                            display: 'flex',
                                                                                            justifyContent: 'space-between',
                                                                                            flexDirection: 'row-reverse',
                                                                                            width: '-webkit-fill-available',
                                                                                            mb: 2
                                                                                        }}
                                                                                    />
                                                                                )
                                                                            }
                                                                            )}
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                ) : message?.intent === "QuickTestResult" ?  (
                                                    <Box sx={{ maxWidth: '100%', width: '450px', mb: 1 }}>
                                                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                                            <img src={GreatJobQuicResult} style={{width: '50px'}} />
                                                            <Typography sx={{ width: '100%', fontStyle: 'italic', fontWeight: '600', fontSize: '18px', color: Colors.black, paddingLeft: '8px !important' }}>
                                                                Great job!
                                                            </Typography>
                                                            <img src={SparkleStars} style={{width: '70px'}} />
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', gap: '8px', padding: '10px 15px', border: '1px solid #ddd', color: Colors.greyText, borderRadius: '15px', background: Colors.white, mt: 2 }}>
                                                            <Typography sx={{ fontSize: '16px', fontWeight: '500' }}>Your Score:</Typography>
                                                            <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                                                <span style={{fontSize: '22px', color: Colors.green}}>{quizResult.correct_answers}</span>/{quizResult.total_questions}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', padding: '10px 15px', background: Colors.lightgGreen, border: `solid 2px ${Colors.green}`, borderRadius: '15px', color: Colors.green }}>
                                                            <Typography sx={{fontWeight: '600'}}>Correct Answers</Typography>
                                                            <Typography sx={{width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', color: Colors.white, background: Colors.green, fontSize: '18px'}}>{quizResult.correct_answers}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', padding: '10px 15px', background: Colors.lightgDanger, border: `solid 2px ${Colors.darkRed}`, borderRadius: '15px', color: Colors.darkRed }}>
                                                            <Typography sx={{fontWeight: '600'}}>Incorrect Answers</Typography>
                                                            <Typography sx={{width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', color: Colors.white, background: Colors.darkRed, fontSize: '18px'}}>{quizResult.total_questions - quizResult.correct_answers}</Typography>
                                                        </Box>
                                                        {quizResult.feedback && (
                                                            <>
                                                                <Typography sx={{ color: Colors.black, marginTop: '20px !important' }}>
                                                                    {quizResult.feedback.strengths || "Good job! Keep practicing."}
                                                                </Typography>
                                                                <Typography sx={{ color: Colors.black, marginTop: '15px !important' }}>
                                                                    "{quizResult.feedback.motivation || "Keep pushing forward! Small consistent efforts lead to mastery."}"
                                                                </Typography>
                                                                <Box sx={{ marginTop: '10px', paddingLeft: '10px', borderLeft: `solid 5px ${Colors.lightSkyBlue}`, color: Colors.dullSkyBlue }}>
                                                                    <Typography sx={{fontSize: '1.2rem', fontWeight: 600}}>What you have to focus on:</Typography>
                                                                    <Typography sx={{ color: Colors.mediumSkyBlue, marginTop: '4px' }}>
                                                                        {quizResult.feedback.improvements || "Review key concepts and strengthen your grasp."}
                                                                    </Typography>
                                                                </Box>

                                                            </>
                                                        )}
                                                    </Box>
                                                ) : message?.intent === "MCQResult" ? (
                                                    <Box sx={{ maxWidth: '100%', width: '450px', mb: 1 }}>
                                                        {quizResult.detailed_results.map((question, qIndex) => (
                                                            <Box key={qIndex} sx={{ paddingBottom: '15px', marginBottom: '10px' }}>
                                                                <Typography
                                                                sx={{ whiteSpace: 'pre-wrap', color: Colors.QuickTestQuestionColor }}
                                                                >
                                                                    Question {qIndex + 1}/{quizResult.detailed_results?.length}
                                                                </Typography>
                                                                <Typography sx={{ whiteSpace: 'pre-wrap', my: '0.5rem !important', fontWeight: '700' }}>
                                                                    {question.question}
                                                                </Typography>
                                                                {question.options.map((option, optionIndex) => {
                                                                    const isUserAnswer = question.user_answer === option;
                                                                    const isCorrect = question.correct_answer === option;
                                                                    return (
                                                                        <FormControlLabel
                                                                            key={optionIndex}
                                                                            disabled={!!question?.user_answer}
                                                                            control={
                                                                                <Checkbox
                                                                                    sx={{
                                                                                        '&.Mui-checked': { color: isUserAnswer ? isCorrect ? `${Colors.green}` : `${Colors.darkRed}` : `${Colors.black}` },                                                                                    }}
                                                                                    checked={isUserAnswer}
                                                                                />
                                                                            }
                                                                            label={<Typography sx={{ color: isUserAnswer ? isCorrect ? `${Colors.green}` : `${Colors.darkRed}` : `${Colors.black}` }}>{option}</Typography>}
                                                                            sx={{
                                                                                border: isUserAnswer
                                                                                    ? isCorrect
                                                                                        ? `2px solid ${Colors.green}`
                                                                                        : `2px solid ${Colors.darkRed}`
                                                                                    : `1px solid ${Colors.descTxt}`,
                                                                                borderRadius: '15px',
                                                                                px: 2,
                                                                                py: 0.8,
                                                                                transition: 'all 0.3s',
                                                                                backgroundColor: isUserAnswer
                                                                                    ? isCorrect
                                                                                        ? `${Colors.lightgGreen}`
                                                                                        : `${Colors.lightgDanger}`
                                                                                    : `${Colors.white}`,
                                                                                margin: 0,
                                                                                display: 'flex',
                                                                                justifyContent: 'space-between',
                                                                                flexDirection: 'row-reverse',
                                                                                width: '-webkit-fill-available',
                                                                                mb: 2
                                                                            }}
                                                                        />
                                                                    );
                                                                })}
                                                                <Box sx={{marginTop: '10px', paddingLeft: '10px', borderLeft: `4px solid ${question.user_answer ? (question.user_answer === question.correct_answer ? Colors.green : Colors.darkRed) : Colors.descTxt}`}}>
                                                                    <Markdown content={question.explanation}/>
                                                                </Box>
                                                            </Box>
                                                        ))}
                                                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                                            <img src={GreatJobQuicResult} style={{width: '50px'}} />
                                                            <Typography sx={{ width: '100%', fontStyle: 'italic', fontWeight: '600', fontSize: '18px', color: Colors.black, paddingLeft: '8px !important' }}>
                                                                Great job!
                                                            </Typography>
                                                            <img src={SparkleStars} style={{width: '70px'}} />
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', gap: '8px', padding: '10px 15px', border: '1px solid #ddd', color: Colors.greyText, borderRadius: '15px', background: Colors.white, mt: 2 }}>
                                                            <Typography sx={{ fontSize: '16px', fontWeight: '500' }}>Your Score:</Typography>
                                                            <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                                                <span style={{fontSize: '22px', color: Colors.green}}>{quizResult.correct_answers}</span>/{quizResult.total_questions}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', padding: '10px 15px', background: Colors.lightgGreen, border: `solid 2px ${Colors.green}`, borderRadius: '15px', color: Colors.green }}>
                                                            <Typography sx={{fontWeight: '600'}}>Correct Answers</Typography>
                                                            <Typography sx={{width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', color: Colors.white, background: Colors.green, fontSize: '18px'}}>{quizResult.correct_answers}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', padding: '10px 15px', background: Colors.lightgDanger, border: `solid 2px ${Colors.darkRed}`, borderRadius: '15px', color: Colors.darkRed }}>
                                                            <Typography sx={{fontWeight: '600'}}>Incorrect Answers</Typography>
                                                            <Typography sx={{width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', color: Colors.white, background: Colors.darkRed, fontSize: '18px'}}>{quizResult.total_questions - quizResult.correct_answers}</Typography>
                                                        </Box>
                                                        {quizResult.feedback && (
                                                            <>
                                                                <Typography sx={{ color: Colors.black, marginTop: '20px !important' }}>
                                                                    {quizResult.feedback.strengths || "Good job! Keep practicing."}
                                                                </Typography>
                                                                <Typography sx={{ color: Colors.black, marginTop: '15px !important' }}>
                                                                    "{quizResult.feedback.motivation || "Keep pushing forward! Small consistent efforts lead to mastery."}"
                                                                </Typography>
                                                                <Box sx={{ marginTop: '10px', paddingLeft: '10px', borderLeft: `solid 5px ${Colors.lightSkyBlue}`, color: Colors.dullSkyBlue }}>
                                                                    <Typography sx={{fontSize: '1.2rem', fontWeight: 600}}>What you have to focus on:</Typography>
                                                                    <Typography sx={{ color: Colors.mediumSkyBlue, marginTop: '4px' }}>
                                                                        {quizResult.feedback.improvements || "Review key concepts and strengthen your grasp."}
                                                                    </Typography>
                                                                </Box>

                                                            </>
                                                        )}
                                                    </Box>                  
                                                ) : (
                                                    <Markdown content={message.message} />
                                                )}
                                            </Box>
                                        </Box>
                                        {message.role === "assistant" && message.intent !== "QuickTest" && message.intent !== "MCQGeneration" && message.intent !== "quickExplanation" && message.status === "completed" && !message.isExplanation && !quizResult && (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-start',
                                                    gap: '10px',
                                                    marginLeft: '50px',
                                                    marginTop: '-5px',
                                                }}
                                            >
                                                <img
                                                    src={CopyIcon}
                                                    style={{
                                                        height: '20px', cursor: 'pointer',
                                                    }}
                                                    onClick={() => handleCopyClick(message.message)}
                                                />
                                                {message?.id && (
                                                    <>
                                                    {message.isLiked !== "dislike" && (
                                                            <img
                                                                src={message.isLiked === "like" ? ActiveLikeIcon : LikeIcon}
                                                                style={{
                                                                    height: "20px",
                                                                    cursor:
                                                                        message.isLiked === "like"
                                                                            ? "not-allowed"
                                                                            : "pointer",
                                                                    opacity: message.isLiked === "like" ? 0.5 : 1,
                                                                }}
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    if (message.isLiked !== "like") {
                                                                        handleLikeOrDislike(message.id, "like");
                                                                    }
                                                                }}
                                                            />
                                                        )}

                                                        {message.isLiked !== "like" && (
                                                            <img
                                                                src={message.isLiked === "dislike" ? ActiveDislikeIcon : DislikeIcon}
                                                                style={{
                                                                    height: "20px",
                                                                    cursor:
                                                                        message.isLiked === "dislike"
                                                                            ? "not-allowed"
                                                                            : "pointer",
                                                                    opacity: message.isLiked === "dislike" ? 0.5 : 1,
                                                                }}
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    if (message.isLiked !== "dislike") {
                                                                        handleLikeOrDislike(message.id, "dislike");
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    </>
                                                )}

                                                <img
                                                    src={playingMessageId === message.id && isPlaying ? PauseIcon : SpeakerIcon}
                                                    style={{
                                                        height: '20px', cursor: 'pointer',
                                                    }}
                                                    onClick={() => textToSpeech(message.message, message.id)}
                                                />
                                                <img
                                                    src={RefreshIcon}
                                                    style={{ height: '20px', cursor: 'pointer' }}
                                                    onClick={() => handleRefreshClick(message, messages, setMessages, sendMessage)}
                                                />
                                                <img
                                                    src={SaveFileIcon}
                                                    style={{ height: '20px', cursor: 'pointer' }}
                                                    onClick={() => handleOpenSaveFileDialog(message)}
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                )
                            }
                            )}
                            <span ref={messagesEndRef}></span>
                        </Box>
                    )}
                </>
            )}
            <Box
                sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    padding: '8px',
                    borderRadius: { xs: '15px', sm: '20px', md: '20px' },
                    backgroundColor: Colors.transparent,
                    border: `solid 1px ${Colors.borderButtonColor}`,
                    width: AppUtils.checkValue(messages) && messages?.length === 0 ? '80%' : '-webkit-fill-available',
                    justifyContent: 'center',
                }}
            >
                 {!isAtBottom && (
                    <Box sx={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', cursor: 'pointer'}} onClick={scrollToBottom}>
                        <img src={ScrollToDown} style={{width: '30px', height: '30px'}} />
                    </Box>
                )}
                {AppUtils.checkValue(image) && (
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            p: 2,
                            flexWrap: 'wrap',
                            width: '-webkit-fill-available',
                            borderRadius: '15px',
                            boxShadow: 1,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            '&::-webkit-scrollbar': { display: 'none' },
                        }}
                    >
                        <Box sx={{ position: 'relative', width: 100, height: 100, borderRadius: 4 }}>
                            <img
                                src={URL.createObjectURL(image)}
                                alt={image?.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                }}
                            />
                            <IconButton
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    backgroundColor: `${Colors.dangerRedMedium} !important`,
                                }}
                                onClick={() => setImage(null)}
                            >
                                <Avatar
                                    src={TrashIcon}
                                    sx={{ width: 20, height: 20 }}
                                />
                            </IconButton>
                        </Box>
                    </Box>
                )}
                {!isQuickTestActive ? (
                    <>
                        <TextareaAutosize
                            minRows={0}
                            maxRows={6}
                            ref={inputRef}
                            placeholder="Type a message..."
                            value={input}
                            className='messageSenderBoxWrap'
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100% !important', m: 'auto' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Button
                                    variant="contained"
                                    onClick={startRecording}
                                    sx={{ mr: '8px', bgcolor: `${Colors.iconButtonBg} !important`, borderRadius: '50%', width: { xs: '35px', md: '40px' }, minWidth: { xs: '35px', md: '40px' }, height: { xs: '35px', md: '40px' }, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'none', "&:hover": { boxShadow: 'none', backgroundColor: Colors.bgLightGrey, color: Colors.white } }}
                                >
                                    <img
                                        src={MicSoundIcon}
                                        style={{ height: { xs: '15px', md: '20px' }, cursor: 'pointer' }}
                                    />
                                </Button>
                                <MyDropzone />
                            </Box>
                            {input.trim() || isLoadingResponse ? (
                                <Button
                                    variant="contained"
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoadingResponse}
                                    sx={{
                                        backgroundColor: Colors.black,
                                        borderRadius: '50%',
                                        width: { xs: '35px', md: '40px' },
                                        minWidth: { xs: '35px', md: '40px' },
                                        height: { xs: '35px', md: '40px' },
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        boxShadow: 'none',
                                        "&:hover": { boxShadow: 'none', backgroundColor: Colors.black, color: Colors.white },
                                        "&:disabled": { backgroundColor: Colors.lightGrey, opacity: 0.7 },
                                    }}
                                >
                                    <img
                                        src={SendButtonIcon}
                                        style={{ height: '20px', cursor: 'pointer' }}
                                    />
                                </Button>
                            ) : (
                                <SessionControls
                                    startSession={startSession}
                                    stopSession={stopSession}
                                    sendTextMessage={(message) => console.log("Sending message:", message)}
                                    isSessionActive={isSessionActive}
                                />
                            )}
                        </Box>
                    </>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100% !important', m: 'auto' }}>
                        <Button
                            variant="contained"
                            onClick={handleStopQuickTest}
                            sx={{ background: Colors.white, color: Colors.black, borderRadius: '10px', padding: '7px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            Stop Exam
                        </Button>
                    </Box>
                )}
            </Box>
            <Dialog
                open={showDialog}
                onClose={() => {
                    setShowDialog(false);
                    if (mediaRecorderRef.current) {
                        mediaRecorderRef.current.stop();
                    }
                }}
                PaperProps={{
                    style: {
                        background: Colors.black,
                        borderRadius: "20px",
                        overflow: "hidden",
                        minWidth: "400px",
                        maxWidth: "400px",
                        margin: "0 auto",
                    },
                }}
            >
                <DialogContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 0,
                        height: "70vh",
                    }}
                >
                    <Box sx={{
                        height: "calc(100% - 95px)",
                        position: "relative",
                        width: "100%",
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                        borderRadius: '0 40px 40px 0'
                    }}>
                        {/* Animated Circle */}
                        <Box
                            sx={{
                                width: "120px",
                                height: "120px",
                                borderRadius: "50%",
                                backgroundImage: `url(${AiGPTLoader})`,
                                backgroundSize: "cover",
                                marginTop: "20px",
                                zIndex: 9999
                            }}
                        ></Box>
                        {/* Gradient Background */}
                        <Box sx={{ width: '100%', height: 'calc(100% - 10px)', backdropFilter: "blur(80px)", position: 'absolute', bottom: '0', left: 0, borderRadius: '0 0 50px 50px', background: 'linear-gradient(to top, #00000000, #00000030)', zIndex: '999' }}></Box>
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                width: "100%",
                                height: "calc(100% - 150px)",
                                display: 'flex',
                                overflowX: 'clip',
                            }}
                        >
                            <img
                                src={RecordingColors}
                                style={{ position: 'absolute', height: 'calc(100% - 0)', width: '100%', bottom: '-40px', left: '0', }}
                            />
                            <img
                                src={SpeekImageTwo}
                                style={{ position: 'absolute', height: 'calc(100% - 10px)', bottom: '-40px', left: '0', animation: "moveLeftRight 7s linear infinite", }}
                            />
                            <img
                                src={SpeekImageOne}
                                style={{ position: 'absolute', height: 'calc(100% - 10px)', bottom: '-40px', left: '0', animation: "moveRightLeft 7s linear infinite", }}
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
                            alignItems: 'center',
                            background: `url(${RecordActionBg})`,
                            backgroundPosition: "10px -200px",
                            padding: "70px 20px 20px",
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                        }}
                    >
                        <IconButton
                            onClick={handleDialogClose}
                            sx={{
                                backgroundColor: "#243547",
                                width: '50px',
                                height: '50px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: Colors.white,
                                "&:hover": { backgroundColor: "#243547", opacity: "0.8" },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            sx={{
                                color: Colors.white,
                                fontSize: "1.5rem",
                                fontWeight: 400,
                                letterSpacing: '0.1rem',
                                textAlign: "center",
                            }}
                        >
                            {isRecording ? "Listening..." : "Processing..."}
                        </Typography>
                        <IconButton
                            onClick={handleStopAndSubmit}
                            sx={{
                                backgroundColor: "#3FBDCB",
                                width: '50px',
                                height: '50px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: Colors.white,
                                "&:hover": { backgroundColor: "#3FBDCB", opacity: "0.8" },
                            }}
                        >
                            <CheckIcon />
                        </IconButton>
                    </Box>
                </DialogContent>
            </Dialog>
            <Dialog
                open={showDialogSaveMessage}
                onClose={() => setShowDialogSaveMessage(false)}
                maxWidth="lg"
                fullWidth
                sx={{ '& .MuiDialog-paperFullWidth': { borderRadius: '20px', overflow: 'hidden', minHeight: '70vh' } }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', height: '65px' }}>
                    <Typography id="create-folder-dialog" sx={{ flexGrow: 1, textAlign: 'center', color: Colors.black, fontWeight: 600, fontSize: '24px' }}>
                        Save Chat As File
                    </Typography>
                    <Button
                        variant="contained"
                        aria-label="add-folder"
                        onClick={() => setOpenCreateFolder(true)}
                        sx={{
                            marginRight: '8px', backgroundColor: Colors.black, borderRadius: '50%',
                            width: { xs: '35px', md: '40px' }, minWidth: { xs: '35px', md: '40px' }, height: { xs: '35px', md: '40px' },
                            display: 'flex', justifyContent: 'center', alignItems: 'center', "&:hover": { backgroundColor: Colors.black, color: Colors.white }
                        }}
                    >
                        <img src={AddFolderIcon} alt="Add Folder" style={{ height: '20px', cursor: 'pointer' }} />
                    </Button>
                </Box>

                <DialogContent sx={{ paddingTop: '1rem !important' }}>
                    {/* Breadcrumb Navigation */}
                    <Breadcrumbs separator=">" sx={{ marginBottom: 2 }}>
                        {moveBreadcrumbs.map((folder, index) => (
                            <Link
                                key={index}
                                component="button"
                                onClick={() => handleMoveBreadcrumbClick(index)}
                                sx={{ textDecoration: "none", fontSize: "1rem", fontWeight: 500, color: index === moveBreadcrumbs.length - 1 ? "black" : Colors.dangerRed, display: "flex", alignItems: "center", gap: 0.5, }}
                            >
                                {index === 0 && <img src={HomeDirectory} style={{ height: "22px" }} />}
                                {folder.name}
                            </Link>
                        ))}
                    </Breadcrumbs>

                    {/* Folder List */}
                    <Box sx={{ height: "calc(100% - 100px)", overflow: "auto", p: '16px' }}>
                        <Grid container spacing={2}>
                            {moveDirectories.length === 0 ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '370px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', height: '100%' }}>
                                        <img src={MainCreateFolder} alt="Main Folder" style={{ width: '100px', height: 'auto' }} />
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                            <Typography sx={{ px: 1, pb: 1, fontSize: '2rem', fontWeight: 600, color: Colors.black }}>
                                                Organize Your Content
                                            </Typography>
                                            <Typography sx={{ px: 1, fontSize: '0.9rem', pb: 3, fontWeight: 500, color: Colors.black }}>
                                                Create and manage folders to store your work efficiently
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                onClick={() => setOpenCreateFolder(true)}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    textTransform: 'capitalize',
                                                    px: 2,
                                                    py: 1,
                                                    borderRadius: 50,
                                                    backgroundColor: Colors.black,
                                                    "&:hover": { backgroundColor: Colors.black, opacity: 0.8 },
                                                    fontSize: '1rem',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                <img src={AddFolderIcon} alt="Add" style={{ marginRight: 8 }} />
                                                Add Folder
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
                                moveDirectories.map((folder) => (
                                    folder.type === "directory" && (
                                        <Grid item xs={10} sm={8} md={2} key={folder.id}>
                                            <Card onClick={() => handleMoveFolderClick(folder)} sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                padding: '16px 0 30px 0',
                                                cursor: folder.type === "directory" ? "pointer" : "default",
                                                borderRadius: "12px",
                                                boxShadow: "none",
                                                position: "relative",
                                                overflow: "hidden",
                                                transition: "all 0.3s",
                                                "&:hover": { backgroundColor: "#f0f0f0" },
                                            }}>
                                                <img src={FolderIcon} alt="Folder" style={{ width: "50px" }} />
                                                <Typography
                                                    fontSize="1rem"
                                                    fontWeight={500}
                                                    sx={{
                                                        textAlign: 'center',
                                                        p: 0,
                                                        color: Colors.black,
                                                        display: "-webkit-box",
                                                        WebkitBoxOrient: "vertical",
                                                        WebkitLineClamp: 2,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {folder.name}
                                                </Typography>
                                            </Card>
                                        </Grid>
                                    )
                                ))
                            )}
                        </Grid>
                    </Box>
                    <CreateFolderDialogContent
                        open={openCreateFolder}
                        onClose={() => setOpenCreateFolder(false)}
                        folderData={null}
                        folderName={folderName}
                        setFolderName={setFolderName}
                        error={error}
                        handleSave={handleSaveFolder}
                    />
                </DialogContent>

                <DialogActions sx={{ borderTop: Colors.borderUserMessage }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'column', gap: 1, width: '100%' }}>
                        {/* <Typography sx={{ fontWeight: 500 }}>File Name</Typography> */}
                        <TextField
                            variant="outlined"
                            fullWidth
                            placeholder='Enter File Name'
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            error={!!error}
                            helperText={error}
                            sx={{ '& .MuiOutlinedInput-notchedOutline': { borderRadius: '2rem', borderColor: `${Colors.InputBorderColor} !important` }, '& .MuiInputBase-input': { padding: '12px 18px', } }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'end', gap: 2, alignItems: 'center', width: '100%' }}>
                            <Button
                                variant="contained"
                                onClick={handelSaveMessageDialogClose}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textTransform: 'capitalize',
                                    px: 2,
                                    py: 1,
                                    borderRadius: 50,
                                    color: Colors.black,
                                    boxShadow: 'none',
                                    borderStyle: 'solid',
                                    borderWidth: '1px',
                                    borderColor: Colors.InputBorderColor,
                                    backgroundColor: Colors.white,
                                    "&:hover": { backgroundColor: Colors.white, opacity: 0.8, color: Colors.black, boxShadow: 'none', },
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSaveFile}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textTransform: 'capitalize',
                                    px: 2,
                                    py: 1,
                                    borderRadius: 50,
                                    backgroundColor: Colors.black,
                                    boxShadow: 'none',
                                    "&:hover": { backgroundColor: Colors.black, opacity: 0.8, boxShadow: 'none', },
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                }}
                            >
                                Save
                            </Button>
                        </Box>
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ChatBot;
