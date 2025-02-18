/* import { Router, Request, Response, NextFunction } from "express";
import {
    audioToAudio,
    audioToText,
    checkAnswer,
    deleteChat,
    getHistory,
    getHistoryDetails,
    getMessage,
    getRemainingQuery,
    saveResponse,
    sendMessage,
    textToAudio,
    updateReaction
} from "./chats.controller";
import { isAuthenticatedUser } from "@Middleware/auth";
import { checkAnswerSchema, textToAudioSchema } from "@Validator/chats.validator";
import validateRequest from "@Middleware/validateRequest";
import { uploadFile } from "@Utils/fileUploader";
import { multerErrorHandler } from "@Middleware/catchAsyncErrors";

const router = Router();

router.get("/getMessage/:id?", getMessage); // Chat history details by ID
(async () => {
    // Configure multer uploader for audio and image files
    const audioUpload = await uploadFile("audio");
    const imageUpload = await uploadFile("context-images");

    // Grouped under /api/v1/chat
    router.use(isAuthenticatedUser); // Apply auth to all routes

    router.get("/history", getHistory); // Fetch chat history
    router.get("/history/:id", getHistoryDetails); // Chat history details by ID
    router.post("/send", imageUpload.single("file"), sendMessage); // Send a message
    router.patch("/react/:id", updateReaction); // React to a message
    router.delete("/delete/:id", deleteChat); // Delete a chat
    router.get("/remaining-queries", getRemainingQuery); // Check remaining queries
    router.post("/text-to-audio", validateRequest(textToAudioSchema), textToAudio); // Send text to get audio streaming
    router.post("/check-answer", validateRequest(checkAnswerSchema), checkAnswer); // Send text to get audio streaming
    router.put("/save-quiz-result/:id", saveResponse); // Save response of given test/quiz
    router.post(
        "/audio-to-text",
        isAuthenticatedUser, // Ensure the user is authenticated
        audioUpload.single("audio"), // Handle file upload
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                // Validate the uploaded file
                
                // Proceed to controller
                await audioToText(req, res, next);
            } catch (err) {
                next(err); // Pass errors to the global error handler
            }
        }
    );
    router.all("/audio-to-audio", audioToAudio);

    router.use(multerErrorHandler);
})();

export default router;
 */

import { Router, Request, Response, NextFunction } from "express";
import {
    convertSpeechToText,
    convertTextToSpeech,
    deleteChat,
    getChatHistory,
    getChatMessages,
    getMessage,
    getQuizResult,
    getRemainingQueries,
    processAudioConversation,
    saveAudioConversation,
    sendMessage,
    updateMessageReaction,
    validateAnswer,
    validateMultiAnswer
} from "./chats.controller";
import { isAuthenticatedUser } from "@Middleware/auth";
import { answerValidationSchema, textToSpeechSchema } from "@Validator/chats.validator";
import validateRequest from "@Middleware/validateRequest";
import { uploadFile } from "@Utils/fileUploader";
import { multerErrorHandler } from "@Middleware/catchAsyncErrors";
import { constants } from "@Constant/constant";

const router = Router();

(async () => {
    // **File Upload Configurations**
    const audioUpload = await uploadFile("audio");
    const imageUpload = await uploadFile("context-images");

    // **File Validation Middleware**
    const validateAudioFile = (req: Request, res: Response, next: NextFunction): void => {
        if (!req.file) {
            res.status(400).json({ message: "Audio file is required" });
            return; // Ensure function exits after sending response
        }

        if (!constants.ALLOWED_MIME_TYPE.includes(req.file.mimetype)) {
            res.status(400).json({ message: "Invalid audio file type" });
            return; // Prevents function from continuing
        }

        next(); // Proceed to the next middleware
    };

    const validateImageFile = (req: Request, res: Response, next: NextFunction): void => {
        if (req.file) {
            if (!constants.ALLOWED_MIME_TYPE.includes(req.file.mimetype)) {
                res.status(400).json({ message: "Invalid image file type" });
                return;
            }
        }
        next();
    };

    // **Apply authentication to all routes**
    router.use(isAuthenticatedUser);

    // **Chat History Endpoints**
    router.get("/", getChatHistory);
    router.get("/:chatId/messages", getChatMessages);

    // **Message Endpoints**
    router.get("/messages/:messageId", getMessage);

    // **Send Message**
    router.post("/messages",
        imageUpload.single("file"),
        validateImageFile,
        sendMessage
    );
    router.patch("/messages/:messageId/reaction", updateMessageReaction);

    // **Chat Management**
    router.delete("/:chatId", deleteChat);

    // **User Quota**
    router.get("/users/quota", getRemainingQueries);

    // **Audio Processing Endpoints**
    router.post("/audio/text-to-speech",
        validateRequest(textToSpeechSchema),
        convertTextToSpeech
    );
    router.post("/audio/speech-to-text",
        audioUpload.single("audio"),
        validateAudioFile,
        convertSpeechToText
    );
    router.get("/audio/conversation", processAudioConversation);
    router.post("/audio/conversation", saveAudioConversation);

    // **Quiz Endpoints**
    router.post("/answers/validate",
        validateRequest(answerValidationSchema),
        validateAnswer
    );

    // **Quiz Endpoints**
    router.post("/answers/multi-validate",validateMultiAnswer);

    // **Quiz Endpoints**
    router.get("/quiz/:messageId/results",getQuizResult);
    
    // **Error handling for file uploads**
    router.use(multerErrorHandler);
})();

export default router;
