import fs from 'fs';
import { catchAsyncErrors } from "@Middleware/catchAsyncErrors";
import { PROMPT } from "@Constant/prompts.constant";
import { generateAudio, generateTranscript, getIntent } from "@Utils/openai.api";
import logger from '@Utils/winston.logger';
import { NextFunction, Request, Response } from 'express';
import { createChat, saveMessages, updateTokenUsage, getChatData, updateReactionStatus, getChatMessagesData, deleteChatData, getRemainingQueriesData, validateLimitRequest, fetchChatHistory, prepareRequestMessage, streamOpenAIResponse, handleTokenUsage, processChatMetadata, generateContent, getChatMessage, deleteQuestionAndResponse, updateResponse, getMessagesData, checkAnswerCorrectOrNot, generateResult, fetchTranscript, saveConversation } from "./chats.service";
import { ENV } from '@Config/env';
import { sendError, sendSuccess } from '@Utils/response.handler';
import { STATUS_CODES } from '@Constant/constant';
import { commonFunctions } from '@Utils/common.functions';

/**
 * Fetches the chat history for the logged-in user with pagination.
 */
export const getChatHistory = catchAsyncErrors(async (req: Request, res: Response) => {
    const userId: number = req.user!.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Input Validation
    if (!userId) {
        logger.warn('User ID is missing in request', {
            module: 'ChatModule',
            requestId: req.requestId || 'N/A',
        });

        return sendError(res, {
            status: STATUS_CODES.BAD_REQUEST,
            error: "Validation Error",
            message: "User ID is required.",
            path: req.originalUrl,
        });
    }

    if (page <= 0 || limit <= 0) {
        logger.warn('Invalid pagination values', {
            module: 'ChatModule',
            requestId: req.requestId || 'N/A',
            page,
            limit
        });

        return sendError(res, {
            status: STATUS_CODES.BAD_REQUEST,
            error: "Validation Error",
            message: "Page and limit must be positive integers.",
            path: req.originalUrl,
        });
    }

    try {
        logger.info('Fetching chat history', {
            module: 'ChatModule',
            requestId: req.requestId || 'N/A',
            userId,
            page,
            limit
        });

        // Fetch chat history from service
        const chatHistory = await fetchChatHistory(userId, page, limit);
        // Handle no chat history
        if (!chatHistory.data || Object.keys(chatHistory.data).length === 0) {
            logger.warn("Chat History not found", {
                module: "ChatModule",
                requestId: req.requestId || "N/A",
                userId,
                path: req.originalUrl,
            });
            return sendError(res, {
                status: STATUS_CODES.NOT_FOUND,
                error: "Not Found",
                message: "No chat history found.",
                path: req.originalUrl,
            });
        }

        logger.warn("Chat History Response Sent", {
            module: "ChatModule",
            requestId: req.requestId || "N/A",
            userId,
            path: req.originalUrl,
            response: {
                ...chatHistory.data,
                pagination: chatHistory.pagination,
            }
        });
        return sendSuccess(res, "Chat history fetched successfully.", {
            history: chatHistory.data,
            pagination: chatHistory.pagination,
        });
    } catch (error: any) {
        logger.error('Error fetching chat history', {
            module: 'ChatModule',
            requestId: req.requestId || 'N/A',
            message: error.message,
        });

        return sendError(res, {
            status: STATUS_CODES.GATEWAY_TIMEOUT,
            error: "Server Error",
            message: "Internal server error. Please try again later.",
            path: req.originalUrl,
        });
    }
});

/**
 * Fetches detailed chat history by chat ID with pagination.
 */
export const getChatMessages = catchAsyncErrors(async (req: Request, res: Response) => {
    const chatId = Number(req.params.chatId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const platform = String(req?.headers?.platform || "web");

    // Input Validation
    if (isNaN(chatId) || chatId <= 0) {
        logger.warn("Invalid Chat ID", {
            module: "ChatModule",
            requestId: req.requestId || "N/A",
            path: req.originalUrl,
            chatId
        });

        return sendError(res, {
            status: STATUS_CODES.BAD_REQUEST,
            error: "Validation Error",
            message: "Invalid chat ID provided.",
            path: req.originalUrl,
        });
    }

    if (page <= 0 || limit <= 0) {
        logger.warn("Invalid pagination values", {
            module: "ChatModule",
            requestId: req.requestId || "N/A",
            path: req.originalUrl,
            page,
            limit
        });

        return sendError(res, {
            status: STATUS_CODES.BAD_REQUEST,
            error: "Validation Error",
            message: "Page and limit must be positive integers.",
            path: req.originalUrl,
        });
    }

    try {
        // Fetch chat data
        const chatData = await getChatData(chatId);

        logger.info("Fetching chat details", {
            module: "ChatModule",
            requestId: req.requestId || "N/A",
            chatId,
            page,
            limit,
            chatData
        });

        if (!chatData) {
            logger.warn("Chat not found", {
                module: "ChatModule",
                requestId: req.requestId || "N/A",
                chatId
            });

            return sendError(res, {
                status: 404,
                error: "Not Found",
                message: "No data found for the provided chat ID.",
                path: req.originalUrl,
            });
        }

        // Fetch paginated chat messages
        const chatDetails = await getChatMessagesData(chatId, platform, page, limit);
        logger.info("Fetching chat details", {
            module: "ChatModule",
            requestId: req.requestId || "N/A",
            chatId,
            page,
            limit,
            chatDetails
        });

        // Construct a response object
        const chatResponse = {
            ...chatData, // Spread existing chat properties
            messages: chatDetails.data || null, // Add chat messages in the final response
        };
        logger.info("Fetching chat details", {
            module: "ChatModule",
            requestId: req.requestId || "N/A",
            chatId,
            page,
            limit,
            chatResponse
        });

        return sendSuccess(res, "Chat history details fetched successfully.", {
            ...chatResponse,  
            pagination: chatDetails.pagination
        });
    } catch (error: any) {
        logger.error("Error fetching chat history details", {
            module: "ChatModule",
            requestId: req.requestId || "N/A",
            error: error.message,
            stack: error.stack,
        });

        return sendError(res, {
            status: STATUS_CODES.GATEWAY_TIMEOUT,
            error: "Server Error",
            message: "Internal server error. Please try again later.",
            path: req.originalUrl,
        });
    }
});

export const getMessage = catchAsyncErrors(async (req: Request, res: Response) => {
    const messageId = Number(req.params.messageId);

    // Input Validation
    if (isNaN(messageId) || messageId <= 0) {
        logger.warn("Invalid/Missing Message ID", {
            module: "ChatModule",
            requestId: req.requestId || "N/A",
            path: req.originalUrl,
            messageId
        });

        return sendError(res, {
            status: STATUS_CODES.BAD_REQUEST,
            error: "Validation Error",
            message: "Invalid/Missing message ID provided.",
            path: req.originalUrl,
        });
    }

    try {
        // Fetch chat data
        const messageContent = await getMessagesData(messageId);

        logger.info("Fetching chat details", {
            module: "ChatModule",
            requestId: req.requestId || "N/A",
            messageId,
        });

        if (!messageContent) {
            logger.warn("Chat not found", {
                module: "ChatModule",
                requestId: req.requestId || "N/A",
                messageContent
            });

            return sendError(res, {
                status: 404,
                error: "Not Found",
                message: "No data found for the provided message ID.",
                path: req.originalUrl,
            });
        }

        return sendSuccess(res, "Message content fetched successfully.", messageContent);
    } catch (error: any) {
        logger.error("Error fetching message content", {
            module: "ChatModule",
            requestId: req.requestId || "N/A",
            error: error.message,
            stack: error.stack,
        });

        return sendError(res, {
            status: STATUS_CODES.GATEWAY_TIMEOUT,
            error: "Server Error",
            message: "Internal server error. Please try again later.",
            path: req.originalUrl,
        });
    }
});

/**
 * Sends user question to open ai and find category of the model
 */
export const sendMessage = catchAsyncErrors(async (req: Request, res: Response) => {
    let { chat_id, question, regenerate_response_id } = req.body;
    
    const userId = req.user!.id;
    
    // Input Validation
    if ((!question || typeof question !== 'string' || question.trim() === '') && !regenerate_response_id) {
        logger.warn("Invalid or missing question in request", { module: "ChatModule", userId });
        return sendError(res, {
            status: STATUS_CODES.BAD_REQUEST,
            error: "Validation Error",
            message: "A valid question is required.",
            path: req.originalUrl,
        });
    }

    try {
        // Validate user's request limits
        const { status, message } = await validateLimitRequest(userId);
        if (!status) {
            logger.warn("User request limit exceeded", { module: "ChatModule", userId });

            return sendError(res, {
                status: 429,
                error: "Rate Limit Exceeded",
                message: message || "You have exceeded your request limit. Please try again later.",
                path: req.originalUrl,
            });
        }

        // Check for Youtube Link
        /* const youtubeLink: string = await commonFunctions.extractYouTubeLink(question);
        console.log('youtubeLink :: ',youtubeLink);
        
        if (youtubeLink) {
            const transcript = await fetchTranscript(youtubeLink);

            if (transcript && transcript.trim().length > 0) {
                const sanitizedQuestion = question.replace(youtubeLink, "").trim();
                question = `Can you please focus on transcript With this users query ${sanitizedQuestion} \n Transcript Provided: ${transcript}`
            }
        }
        console.log('question :: ',question);
        return false; */
        // Create a new chat if chat_id is not provided
        const chatId = chat_id || (await createChat(userId)).id;

        // Get the system prompt based on the user's question
        const systemPrompt = await getIntent(question);
        logger.info("Get Intent", { module: "ChatModule", userId, intent: systemPrompt.content, systemPrompt: systemPrompt });
        if (!systemPrompt) {
            logger.warn("No system prompt identified", { module: "ChatModule", userId, question });
            return sendError(res, {
                status: STATUS_CODES.BAD_REQUEST,
                error: "Intent Detection Error",
                message: "Could not determine intent. Please rephrase your question.",
                path: req.originalUrl,
            });
        }

        // Fetch the system message for the detected prompt
        const systemMessage = PROMPT[systemPrompt.content];
        if (!systemMessage) {
            logger.warn("System message missing for detected intent", { module: "ChatModule", userId, intent: systemPrompt.content });
            return sendError(res, {
                status: STATUS_CODES.BAD_REQUEST,
                error: "Prompt Error",
                message: "No prompt available for the detected intent.",
                path: req.originalUrl,
            });
        }

        // Process the request based on the prompt type
        const result = await handlePromptType(
            systemPrompt.content,
            req,
            res,
            chatId,
            systemMessage,
            question
        );

        // Ensure response is sent only once
        if (!res.writableEnded) {
            return sendSuccess(res, "Message processed successfully.", result);
        }
    } catch (error: any) {
        logger.error("Error processing message", {
            module: "ChatModule",
            userId,
            message: error.message,
        });
        return sendError(res, {
            status: STATUS_CODES.GATEWAY_TIMEOUT,
            error: "Server Error",
            message: "An unexpected error occurred. Please try again later.",
            path: req.originalUrl,
        });
    }
});

export const saveResponse = catchAsyncErrors(async (req: Request, res: Response) => {
    const response = req.body.response;
    const id: number = Number(req.params.messageId)
    const userId = req.user!.id;
    try {
        // Validate user's request limits
        const isUpdated = await updateResponse(id, response);
        
        if (!res.writableEnded) {
            return sendSuccess(res, "Response updated successfully.", isUpdated);
        }
    } catch (error: any) {
        logger.error("Error processing save message", {
            module: "ChatModule",
            userId,
            message: error.message,
        });
        return sendError(res, {
            status: STATUS_CODES.GATEWAY_TIMEOUT,
            error: "Server Error",
            message: "An unexpected error occurred. Please try again later.",
            path: req.originalUrl,
        });
    }
});

const handlePromptType = async (
    promptType: string,
    req: any,
    res: Response,
    chatId: number,
    systemMessage: string,
    question: string
): Promise<any> => {
    try {
        logger.info("Handling prompt type", { module: "ChatModule", promptType, chatId });
        
        const textToTextTypes = [
            "General",
            "Summary",
            "ImagewithText",
            "GraphAnalysis",
            "DiagramRecognition",
            "ImageToText",
            "ConceptExplanation",
            "StepByStepSolution",
            "YouTubeTranscriptSummary"
        ];

        if (textToTextTypes.includes(promptType)) {
            return await textToText(req, res, promptType, systemMessage, chatId);
        }

        switch (promptType) {
            case "Mindmap":
                return await generateMindmap(req, chatId, systemMessage, question, promptType);

            case "Flashcard":
                return await generateFlashCard(req, chatId, systemMessage, question, promptType);

            case "QuickTest":
                return await generateQuickTest(req, chatId, PROMPT.QuickTest, question, promptType);

            case "MCQGeneration":
                return await generateMCQGeneration(req, chatId, PROMPT.MCQGeneration, question, promptType);

            default:
                logger.warn("Unsupported prompt type", { module: "ChatModule", promptType });
                throw new Error("Unsupported system prompt type: " + promptType);
        }
    } catch (error: any) {
        logger.error("Error in handlePromptType", {
            module: "ChatModule",
            promptType,
            message: error.message,
        });
        throw error;
    }
};

const textToText = async (req: Request, res: Response, intent: String, systemPrompt: string, chatId: number) => {
    let { question, regenerate_response_id } = req.body;

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    try {
        let filePath: string = "";
        if(req.file){
            filePath = req?.file?.filename;
        }
        let questionId: number = 0;
        if(regenerate_response_id){
            const messageData = await getChatMessage(regenerate_response_id);
            if(messageData?.question_id){
                questionId = messageData.question_id;
                const questionData = await getChatMessage(messageData?.question_id);
                question = questionData?.message;
            }
        }

        // Step 1: Prepare Request
        const requestMessage = await prepareRequestMessage(chatId, question, systemPrompt, filePath, regenerate_response_id);
        logger.info("Prepared API request", {
            module: "ChatModule",
            sub_module: "Text to Text",
            requestId: req.requestId || "N/A",
            chatId: chatId,
            requestMessage
        });


        // Step 2: Stream OpenAI Response
        const { fullResponse, usageInfo } = await streamOpenAIResponse(requestMessage, res);

        logger.info("Received OpenAI response", {
            module: "ChatModule",
            sub_module: "Text to Text",
            requestId: req.requestId || "N/A",
            chatId: chatId,
            fullResponse,
            usageInfo
        });

        // Step 3: Save Messages
        const savedMessages: SavedMessages = await saveMessages(chatId, question, fullResponse, intent, filePath);
        logger.info("Saved chat messages", {
            module: "ChatModule",
            sub_module: "Text to Text",
            requestId: req.requestId || "N/A",
            chatId: chatId,
            userId: req.user!.id,
            request: {
                chatId, question, fullResponse, intent
            },
            response: savedMessages,
        });

        // Step 4: Handle Token Usage
        const tokenResponse = await handleTokenUsage(req.user!.id, requestMessage, fullResponse, usageInfo);
        logger.info("Handled token usage", {
            module: "ChatModule",
            sub_module: "Text to Text",
            requestId: req.requestId || "N/A",
            chatId: chatId,
            userId: req.user!.id,
            request: {
                requestMessage, fullResponse, usageInfo
            },
            response: tokenResponse,
        });

        // Step 5: Process Chat Metadata (Title, Description)
        await processChatMetadata(chatId, fullResponse, req.user!.id);

        // Step 6: Update Token Usage in Chat
        await updateTokenUsage(chatId, tokenResponse, savedMessages);
        logger.info("Updated token usage in chat", {
            module: "ChatModule",
            sub_module: "Text to Text",
            requestId: req.requestId || "N/A",
            chatId: chatId,
            userId: req.user!.id,
            request: {
                savedMessages
            },
            response: tokenResponse,
        });

        if(regenerate_response_id){
            
            const deleteResponse = await deleteQuestionAndResponse(regenerate_response_id, questionId, savedMessages.responseId);
            logger.info("Deleting existing question and response.", {
                module: "ChatModule",
                sub_module: "Text to Text",
                requestId: req.requestId || "N/A",
                chatId: chatId,
                userId: req.user!.id,
                request: {
                    regenerate_response_id,
                    questionId,
                    newResponseId: savedMessages.responseId
                },
                response: deleteResponse,
            });
        }

        res.write(`\n${JSON.stringify(savedMessages.response)}\n`);
        res.end();
    } catch (error: any) {
        logger.error("Error in textToText processing", {
            module: "ChatModule",
            userId: req.user!.id,
            message: error.message,
            stack: error.stack,
            error: error,
        });
        res.write(JSON.stringify({ error: error.message }));
        res.end();
    }
};

/* Generates Mindmap */
const generateMindmap = async (
    req: any,
    chatId: number,
    systemMessage: string,
    transcript: string,
    intent: string
): Promise<any> => {
    return await generateContent(req, chatId, systemMessage, transcript, intent, "Mindmap");
};

/* Generates Flashcard */
const generateFlashCard = async (
    req: any,
    chatId: number,
    systemMessage: string,
    transcript: string,
    intent: string
): Promise<any> => {
    return await generateContent(req, chatId, systemMessage, transcript, intent, "Flashcard");
};

/* Generates MCQ */
const generateMCQGeneration = async (
    req: any,
    chatId: number,
    systemMessage: string,
    transcript: string,
    intent: string
): Promise<any> => {
    return await generateContent(req, chatId, systemMessage, transcript, intent, "MCQ");
};


/* Generates Quick Test */
const generateQuickTest = async (
    req: any,
    chatId: number,
    systemMessage: string,
    transcript: string,
    intent: string
): Promise<any> => {
    return await generateContent(req, chatId, systemMessage, transcript, intent, "Quicktest");
};

/* Update Reaction Status on a Chat Message */
export const updateMessageReaction = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const messageId = parseInt(req.params.messageId);
        const { reaction_status } = req.body;

        // Validate reaction_status value
        const validReactions = ["like", "dislike", null];
        if (!validReactions.includes(reaction_status)) {
            logger.warn("Invalid reaction status received", {
                module: "ChatModule",
                messageId,
                reaction_status,
            });

            return sendError(res, {
                status: STATUS_CODES.BAD_REQUEST,
                error: "Bad Request",
                message: "Invalid reaction_status value. Allowed values are 'like', 'dislike', or null.",
                path: req.originalUrl,
            });
        }

        // Update the reaction status
        const updatedMessage = await updateReactionStatus(messageId, reaction_status);

        if (!updatedMessage) {
            logger.warn("Chat message not found for reaction update", {
                module: "ChatModule",
                messageId,
            });

            return sendError(res, {
                status: 404,
                error: "Not Found",
                message: "Chat message not found.",
                path: req.originalUrl,
            });
        }

        logger.info("Reaction status updated successfully", {
            module: "ChatModule",
            messageId,
            reaction_status,
        });

        return sendSuccess(res, "Reaction status updated successfully.", updatedMessage);
    } catch (error: any) {
        logger.error("Error while updating reaction status", {
            module: "ChatModule",
            message: error.message,
            stack: error.stack,
        });

        return sendError(res, {
            status: STATUS_CODES.GATEWAY_TIMEOUT,
            error: "Server Error",
            message: "An error occurred while updating the reaction status.",
            path: req.originalUrl,
        });
    }
});

/* Generates Audio File from Input Text */
export const convertTextToSpeech = catchAsyncErrors(async (req: Request, res: Response) => {
    const inputText: string = req.body.context;

    try {
        logger.info("Received text-to-audio request", {
            module: "AudioModule",
            requestId: req.requestId || "N/A",
            userId: req.user?.id || "Guest",
            inputText,
        });

        const audioStream = await generateAudio(inputText, "tts-1", "alloy");

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Transfer-Encoding", "chunked");
        res.setHeader("Cache-Control", "no-cache");

        audioStream.pipe(res);

        audioStream.on("end", () => {
            logger.info("Audio streaming completed successfully", {
                module: "AudioModule",
                requestId: req.requestId || "N/A",
                userId: req.user?.id || "Guest",
            });
        });

        audioStream.on("error", (err: any) => {
            logger.error("Error in audio stream", {
                module: "AudioModule",
                requestId: req.requestId || "N/A",
                userId: req.user?.id || "Guest",
                error: err.message,
            });
            // res.status(500).end("Error streaming audio.");
            // return sendError(res, "Error streaming audio.", []);
            return sendError(res, {
                status: STATUS_CODES.GATEWAY_TIMEOUT,
                error: "Server Error",
                message: "Error streaming audio.",
                path: req.originalUrl,
            });
        });
    } catch (error: any) {
        logger.error("Error generating audio", {
            module: "AudioModule",
            requestId: req.requestId || "N/A",
            userId: req.user?.id || "Guest",
            error: error.message,
        });
        return sendError(res, {
            status: STATUS_CODES.GATEWAY_TIMEOUT,
            error: "Server Error",
            message: "Failed to generate audio.",
            path: req.originalUrl,
        });
    }
});

/* Audio to text */
export const convertSpeechToText = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        // return res.status(400).json({ error: "No audio file uploaded" });
        return sendError(res, {
            status: STATUS_CODES.BAD_REQUEST,
            error: "Server Error",
            message: "No audio file uploaded.",
            path: req.originalUrl,
        });
    }

    const filePath = req.file.path
    const transcriptionText: any = await generateTranscript(filePath)

    fs.unlinkSync(filePath);
    return sendSuccess(res, "Text generated.", {
        text: transcriptionText.text
    });
})

/* Real-time Audio-to-Audio Generation */
export const processAudioConversation = catchAsyncErrors(async (req: Request, res: Response) => {
    try {
        const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-realtime-preview-2024-12-17",
                voice: "verse",
                modalities: ["audio", "text"],
                turn_detection: {
                    type: "server_vad",
                    // threshold: 1.0,
                    // create_response: true,
                },
                /* tools: [
                    {
                        type: "function",
                        name: "get_current_conversation",
                        description: "Retrieves the current conversation text from the active session.",
                        parameters: {
                            type: "object",
                            properties: {
                                session_id: {
                                    type: "string",
                                    description: "The session ID of the active conversation."
                                }
                            },
                            required: ["session_id"]
                        }
                    }
                ] */
            }),
        });

        const data = await response.json();
        console.log('data :: ',data);
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ error: "Failed to generate token." });
    }
});

export const saveAudioConversation = catchAsyncErrors(async (req: Request, res: Response) => {
    try {
        const userId = Number(req.user?.id || 0);
        const conversation = req.body;

        if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
            return sendError(res, {
                status: STATUS_CODES.BAD_REQUEST,
                error: "Invalid Data",
                message: "No conversation data provided or invalid format.",
                path: req.originalUrl,
            });
        }

        // Save the conversation
        const updatedMessage = await saveConversation(conversation, userId);

        return sendSuccess(res, "Audio conversation saved successfully.", { chatId: updatedMessage });

    } catch (error: any) {
        logger.error("Error while saving audio conversation", {
            module: "ChatModule",
            message: error.message,
            stack: error.stack,
        });

        return sendError(res, {
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            error: "Server Error",
            message: "An error occurred while saving the audio conversation.",
            path: req.originalUrl,
        });
    }
});

/* Real-time Audio-to-Audio Generation */

/* Soft Delete a Chat */
export const deleteChat = catchAsyncErrors(async (req: Request, res: Response) => {
    const chatId = parseInt(req.params.chatId, 10);

    // Validate chat ID
    if (isNaN(chatId)) {
        return sendError(res, {
            status: STATUS_CODES.BAD_REQUEST,
            error: "Invalid Request",
            message: "Invalid chat ID.",
            path: req.originalUrl,
        });
    }

    // Check if the chat exists
    const existingChat = await getChatData(chatId);
    if (!existingChat) {
        return sendError(res, {
            status: 404,
            error: "Not Found",
            message: "Chat not found.",
            path: req.originalUrl,
        });
    }

    // Soft delete the chat
    await deleteChatData(chatId);

    return sendSuccess(res, "Chat has been deleted successfully.", null);
});

/* Get Remaining Query Count */
export const getRemainingQueries = catchAsyncErrors(async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        // Check if user ID exists
        if (!userId) {
            logger.warn("User ID missing in request", { module: "ChatModule" });
            return sendError(res, {
                status: 401,
                error: "Unauthorized",
                message: "User is not authenticated.",
                path: req.originalUrl,
            });
        }

        // Fetch remaining queries
        const remainingQueries = await getRemainingQueriesData(userId);
        const queryLimit = ENV.QUERY_USAGE_LIMIT;

        logger.info("Fetched remaining queries", { userId, remainingQueries, queryLimit });

        // Send success response
        return sendSuccess(res, "Remaining queries fetched successfully.", {
            remaining_queries: remainingQueries,
            limit: queryLimit,
        });
    } catch (error: any) {
        logger.error("Error fetching remaining queries", {
            module: "ChatModule",
            error: error.message,
        });

        // Error response
        return sendError(res, {
            status: STATUS_CODES.GATEWAY_TIMEOUT,
            error: "Server Error",
            message: "Failed to fetch remaining queries.",
            path: req.originalUrl,
        });
    }
});

export const validateAnswer = catchAsyncErrors(async (req: Request, res: Response) => {
    try {
        
        const { question_id, selected_answer } = req.body
        const result = await checkAnswerCorrectOrNot(question_id, selected_answer);
        
        // Send success response
        return sendSuccess(res, result.message, {
            explanation: result?.explanation,
        });
    } catch (error: any) {
        logger.error("Error fetching remaining queries", {
            module: "ChatModule",
            error: error.message,
        });

        // Error response
        return sendError(res, {
            status: STATUS_CODES.GATEWAY_TIMEOUT,
            error: "Server Error",
            message: "Failed to fetch remaining queries.",
            path: req.originalUrl,
        });
    }
});

export const validateMultiAnswer = catchAsyncErrors(async (req: Request, res: Response) => {
    try {
        // Ensure the request body is an array
        if (!Array.isArray(req.body) || req.body.length === 0) {
            return sendError(res, {
                status: STATUS_CODES.BAD_REQUEST,
                error: "Validation Error",
                message: "Answers must be provided as a non-empty array.",
                path: req.originalUrl,
            });
        }

        // Process each answer using Promise.all to handle multiple requests asynchronously
        const results = await Promise.all(
            req.body.map(async ({ question_id, selected_answer }) => {
                const result = await checkAnswerCorrectOrNot(question_id, selected_answer);
                return {
                    question_id,
                    selected_answer,
                    is_correct: result.status,
                    explanation: result.explanation,
                };
            })
        );

        // Send success response with results
        return sendSuccess(res, "Quiz answers validated successfully.", results);

    } catch (error: any) {
        logger.error("Error validating multiple answers", {
            module: "ChatModule",
            error: error.message,
        });

        // Error response
        return sendError(res, {
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            error: "Server Error",
            message: "Failed to validate quiz answers.",
            path: req.originalUrl,
        });
    }
});

export const getQuizResult = catchAsyncErrors(async (req: Request, res: Response) => {
    const messageId = parseInt(req.params.messageId);

    // Validate message ID
    if (isNaN(messageId)) {
        logger.warn("Invalid quiz ID received", {
            module: "QuizModule",
            sub_module: "ResultGeneration",
            request: req.params
        });

        return sendError(res, {
            status: STATUS_CODES.BAD_REQUEST,
            error: "Invalid Request",
            message: "Please enter a valid Quiz ID.",
            path: req.originalUrl,
        });
    }

    try {
        const quizResult = await generateResult(messageId);

        if (!quizResult) {
            return sendError(res, {
                status: STATUS_CODES.NOT_FOUND,
                error: "Quiz Result Not Found",
                message: "No result found for the given Quiz ID.",
                path: req.originalUrl,
            });
        }

        logger.info(`Successfully generated quiz result for Message ID: ${messageId}`, {
            module: "QuizModule",
            sub_module: "ResultGeneration",
            messageId
        });

        return sendSuccess(res, "Quiz result generated successfully.", quizResult);
    } catch (error: any) {
        logger.error(`Error generating quiz result for Message ID: ${messageId}`, {
            module: "QuizModule",
            sub_module: "ResultGeneration",
            messageId,
            message: error.message,
            stack: error.stack
        });

        return sendError(res, {
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            error: "Quiz Result Generation Failed",
            message: "An error occurred while generating the quiz result.",
            path: req.originalUrl,
        });
    }
});
