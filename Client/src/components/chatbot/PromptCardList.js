import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import Colors from '../../Helper/Colors';

// Icons 
import AiGPTLoader from "../../assets/icons/aiGPTLoader.gif";
import SummaryIcon from "../../assets/icons/summary.svg";
import SparkleStarsIcon from "../../assets/icons/sparkleStars.svg";
import MindMap from "../../assets/icons/mindMap.svg";
import LeafMindMap from "../../assets/icons/leafMindMap.svg";
import FlashCard from "../../assets/icons/flashCard.svg";
import FlashCardCreate from "../../assets/icons/flashCardCreate.svg";
import EssayUpload from "../../assets/icons/essayUpload.svg";
import AnalyzeEssay from "../../assets/icons/analyzeEssay.svg";
import QuickTest from "../../assets/icons/quickTest.svg";
import ListsBullets from "../../assets/icons/listsBullets.svg";
import PracticeTest from "../../assets/icons/practiceTest.svg";
import TestPractice from "../../assets/icons/testPractice.svg";
import AudioToTest from "../../assets/icons/audioToTest.svg";
import ConvertToAudio from "../../assets/icons/convertToAudio.svg";
import Digitizing from "../../assets/icons/digitizing.svg";
import HandwrittenNotes from "../../assets/icons/handwrittenNotes.svg";
import TextFromImage from "../../assets/icons/textFromImage.svg";
import ImageEdit from "../../assets/icons/imageEdit.svg";
import AnalyzeGraph from "../../assets/icons/analyzeGraph.svg";
import Diagram from "../../assets/icons/diagram.svg";
import RecognizeDiagram from "../../assets/icons/recognizeDiagram.svg";
import ProblemSolve from "../../assets/icons/problemSolve.svg";
import SolveProblems from "../../assets/icons/solveProblems.svg";
import StudyPlan from "../../assets/icons/studyPlan.svg";
import Plane from "../../assets/icons/plane.svg";
import Simplify from "../../assets/icons/simplify.svg";
import ExplainConcept from "../../assets/icons/explainConcept.svg";
import Concept from "../../assets/icons/concept.svg";
import GraphAnalyze from "../../assets/icons/graphAnalyze.svg";

const customPromptList = [
    {
        itemId: 1,
        title: "Create a Summary",
        description: "Turn your notes or text into concise key points.",
        icon: SummaryIcon,
        staticIcon: SparkleStarsIcon,
        buttonText: "Start Summarizing",
    },
    {
        itemId: 2,
        title: "Create a Mind Map",
        description: "Visualize and organize concepts effectively",
        icon: MindMap,
        staticIcon: LeafMindMap,
        buttonText: "Build Mind Map",
    },
    {
        itemId: 3,
        title: "Generate Flashcard",
        description: "Create interactive flashcards for active recall and retention",
        icon: FlashCard,
        staticIcon: FlashCardCreate,
        buttonText: "Create Flashcards",
    },
    {
        itemId: 4,
        title: "Analyze an Essay",
        description: "Get paragraph-wise feedback and suggestions for your essay",
        icon: EssayUpload,
        staticIcon: AnalyzeEssay,
        buttonText: "Upload Essay",
    },
    {
        itemId: 5,
        title: "Quick Knowledge Test",
        description: "Generate instant MCQs and test your understanding",
        icon: QuickTest,
        staticIcon: ListsBullets,
        buttonText: "Take a Quick Test",
    },
    {
        itemId: 6,
        title: "Comprehensive Practice Test",
        description: "Attempt a full-length test with 25 questions and in-depth feedbacks",
        icon: PracticeTest,
        staticIcon: TestPractice,
        buttonText: "Start Practice Test",
    },
    {
        itemId: 7,
        title: "Convert Audio to Text",
        description: "Transcribe lectures or recordings into concise summaries",
        icon: AudioToTest,
        staticIcon: ConvertToAudio,
        buttonText: "Transcribe Audio",
    },
    {
        itemId: 8,
        title: "Digitize Handwritten Notes",
        description: "Convert handwritten content into editable digital text",
        icon: Digitizing,
        staticIcon: HandwrittenNotes,
        buttonText: "Start Digitizing",
    },
    {
        itemId: 9,
        title: "Extract Text from Images",
        description: "Upload images to extract and analyze text",
        icon: TextFromImage,
        staticIcon: ImageEdit,
        buttonText: "Upload Image",
    },
    {
        itemId: 10,
        title: "Analyze Graphs",
        description: "Gain insights from trends and data visualizations",
        icon: AnalyzeGraph,
        staticIcon: GraphAnalyze,
        buttonText: "Analyze Graphs",
    },
    {
        itemId: 11,
        title: "Recognize Diagrams",
        description: "Analyze diagrams and get step-by-step explanations",
        icon: Diagram,
        staticIcon: RecognizeDiagram,
        buttonText: "Upload Diagram",
    },
    {
        itemId: 12,
        title: "Solve Problems Step-by-Step",
        description: "Get solutions for math, physics, or chemistry problems",
        icon: ProblemSolve,
        staticIcon: SolveProblems,
        buttonText: "Solve Problem",
    },
    {
        itemId: 13,
        title: "Generate Study Plans",
        description: "Create personalized study plans based on your curriculum",
        icon: StudyPlan,
        staticIcon: Plane,
        buttonText: "Plan My Study",
    },
    {
        itemId: 14,
        title: "Simplify Text",
        description: "Break down complex language for easier understanding",
        icon: Simplify,
        staticIcon: Text,
        buttonText: "Simplify",
    },
    {
        itemId: 15,
        title: "Explain a Concept",
        description: "Get detailed explanations tailored to your level of understanding",
        icon: ExplainConcept,
        staticIcon: Concept,
        buttonText: "Explain",
    },
];

const bannerContentList = [
    {
        itemId: 1,
        title: "What do you want to summarize today? 🤔",
        description: "Enter your topic, and I'll generate a concise summary for you!",
    },
    {
        itemId: 2,
        title: "What do you want to create a mind map for?",
        description: "Enter your topic or paste your content, and I'll design an engaging mind map for you!",
    },
    {
        itemId: 3,
        title: "What do you want to create Flashcards for?",
        description: "Enter your topic or subject, and I'll create detailed, easy-to-study flashcards just for you!",
    },
    {
        itemId: 4,
        title: "What topic do you want to analyze for essay?",
        description: "Upload an image or document of your essay.",
    },
    {
        itemId: 5,
        title: "What topic do you want to create MCQs for?",
        description: "Enter your subject or topic, and I'll generate engaging multiple-choice questions to test your knowledge!",
    },
    {
        itemId: 7,
        title: "What do you want to summarize today? 🤔",
        description: "Enter your topic, and I'll generate a concise summary for you!",
    },
    {
        itemId: 9,
        title: "What content do you want to extract from your image?",
        description: "Upload an image or document, and I’ll extract the text for you in seconds. Ensure the image is clear and contains readable text for the best results",
    },
    {
        itemId: 9,
        title: "What content do you want to extract from your image?",
        description: "Upload an image or document, and I’ll extract the text for you in seconds. Ensure the image is clear and contains readable text for the best results",
    },
];

const PromptCardList = ({ messages }) => {
        const [selectedBannerContent, setSelectedBannerContent] = useState(null);
        const [showBanner, setShowBanner] = useState(false);

        const handleCardButtonClick = (itemId) => {
            const bannerData = bannerContentList.find((content) => content.itemId === itemId);

            if (bannerData) {
                setSelectedBannerContent(bannerData);
                setShowBanner(true);
            } else {
                console.error("No banner content found for itemId:", itemId);
            }
        };

    return (
        <>
            {!showBanner && Array.isArray(messages) && messages?.length === 0 &&
                <Box
                    sx={{
                        width: '80%',
                        padding: '16px',
                        display: 'flex',
                        gap: '16px',
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        touchAction: 'pan-x',
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch',
                        '&::-webkit-scrollbar': { display: 'none' },
                    }}
                >
                    {Array.isArray(customPromptList) && customPromptList?.length > 0 && customPromptList.map((prompt) => (
                        <Box
                            key={prompt.itemId}
                            sx={{
                                minWidth: '240px',
                                height: '280px',
                                backgroundColor: Colors.bgLightGrey,
                                borderRadius: { xs: '20px', md: '35px' },
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                scrollSnapAlign: 'start',
                            }}
                        >
                            <Box
                                component={'img'}
                                src={prompt.staticIcon}
                                sx={{
                                    width: '50px',
                                    height: 'auto',
                                    position: 'absolute',
                                    right: '5px',
                                    bottom: 'calc(100% - 75%)',
                                }}
                            />
                            <Box sx={{ p: 2 }}>
                                <Box component={'img'} src={prompt.icon} sx={{ height: 35, width: 'auto' }} />
                                <Typography sx={{ fontSize: '1.3rem', fontWeight: '600', color: Colors.black }}>
                                    {prompt.title}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '0.9rem',
                                        fontWeight: '400',
                                        color: Colors.black,
                                        display: "-webkit-box",
                                        overflow: "hidden",
                                        WebkitBoxOrient: "vertical",
                                        WebkitLineClamp: 3,
                                        lineHeight: "1.5",
                                    }}
                                >
                                    {prompt.description}
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                onClick={() => handleCardButtonClick(prompt.itemId)}
                                sx={{
                                    mx: 2,
                                    mb: 2,
                                    backgroundColor: Colors.black,
                                    color: Colors.white,
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    textTransform: 'capitalize',
                                    borderRadius: '30px',
                                    "&:hover": { backgroundColor: "#333" },
                                }}
                            >
                                {prompt.buttonText}
                            </Button>
                        </Box>
                    ))}
                </Box>
            }
            {showBanner && messages.length === 0 && selectedBannerContent && (
                <Box sx={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    flexDirection: 'column',
                    gap: '8px',
                    '&::-webkit-scrollbar': { display: 'none' },
                }}>
                    <Box
                        component="img"
                        src={AiGPTLoader}
                        sx={{ width: '150px', height: '150px', marginBottom: 2 }}
                    />
                    <Typography variant="h5" fontWeight="600">
                        {selectedBannerContent.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: Colors.grey }}>
                        {selectedBannerContent.description}
                    </Typography>
                </Box>
            )}
        </>
    );
};

export default PromptCardList;
