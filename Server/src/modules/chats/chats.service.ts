// System Default Libraries
import moment from "moment";
import openai from "@Config/openAi";
import { Response } from 'express';

// Env, Logs and common functions of API's
import { ENV } from "@Config/env";
import { calculateUsedTokens, generateChatCompletion, generateTitleAndDescription } from "@Utils/openai.api";
import { customLogger } from "@Utils/logging.function";
import logger from "@Utils/winston.logger";

import { YoutubeTranscript } from 'youtube-transcript';

// Database table entities
import { AppDataSource } from "@Config/connection";
import { Quiz } from "@Entity/Quizzes";
import { ChatMessage } from "@Entity/ChatMessage";
import { Chats } from "@Entity/Chats";
import { UserTokenUsage } from "@Entity/UserTokenUsage";
import { Directories } from "@Entity/Directories";
import { EntityManager } from "typeorm";
import { PROMPT } from "@Constant/prompts.constant";

// Register entity repository
const chatRepository = AppDataSource.getRepository(Chats);
const chatMessageRepository = AppDataSource.getRepository(ChatMessage);

export const getChatHistory = async (chatId: number, lastMessageId?: number) => {
    
    const messages = await fetchNewMessages(chatId, lastMessageId);
    
    // Map messages to optimize token usage
    const historyRequest = messages.map((msg, index) => {
        if (msg.files) {
            // Include the image URL only for the last message or the first few recent messages
            if (index === messages.length - 1 || index > messages.length - 3) {
                return {
                    role: msg.role,
                    content: [
                        { type: "text", text: msg.message },
                        {
                            type: "image_url",
                            image_url: {
                                url: `${ENV.APP_URL}/chat_image/${msg.files}`,
                            },
                        },
                    ],
                };
            }

            // Replace image URL with a summary for older messages
            return {
                role: msg.role,
                content: [
                    { type: "text", content: msg.message },
                    { type: "text", content: `${ENV.APP_URL}/chat_image/${msg.files}` },
                ],
            };
        }

        // For messages without files
        return {
            role: msg.role,
            content: msg.message,
        };
    });
    return historyRequest;
};

/**
 * Fetch new messages for the chat
 */
export const fetchNewMessages = async (chatId: number, lastMessageId?: number): Promise<any[]> => {
    /* return chatMessageRepository.createQueryBuilder("message")
        .select(["message.role", "message.message"])
        .where("message.chat_id = :chatId", { chatId })
        .andWhere("message.id > :lastMessageId", { lastMessageId })
        .orderBy("message.id", "ASC")
        .getMany(); */
    const queryBuilder = chatMessageRepository
        .createQueryBuilder("message")
        .select(["message.message as message", "message.id as id", "message.role as role", "message.files as files"])
        .where("message.chat_id = :chatId", { chatId })
        .orderBy("message.id", "ASC");

    if (lastMessageId) {
        queryBuilder.andWhere("message.id > :lastMessageId", { lastMessageId });
    }

    return await queryBuilder.getRawMany();
};


const getPreviousConversationHistory = async (chatId: number, regenerateResponseId: number) => {
    const chats = await chatRepository.createQueryBuilder("chat")
        .select(["chat.summary as summary", "chat.last_message_id as last_message_id"])
        .where("chat.summary IS NOT NULL")
        .andWhere("chat.id = :id", { id: chatId })
        .orderBy("chat.id", "DESC")
        .limit(1)
        .getRawOne();

        
    let lastMessageId = "";
    let previousMessage: any = "";
    // Fetch previous messages based on `last_message_id`
    if(regenerateResponseId){
        previousMessage = await getChatHistory(chatId, regenerateResponseId);
    }else if(chats?.last_message_id){
        previousMessage = await getChatHistory(chatId, chats.last_message_id);
    }else{
        previousMessage = await getChatHistory(chatId);
    }
    /* const previousMessage: any = chats?.last_message_id
        ? await getChatHistory(chatId, chats.last_message_id)
        : await getChatHistory(chatId); */

    
    // Build history by including `chat_summary` only if it exists
    const history = chats?.summary
        ? [{ role: "user", content: chats.summary }].concat(previousMessage)
        : previousMessage;

    return history;
};

// Text to text business logic :: START
export const prepareRequestMessage = async (chatId: number, question: string, systemPrompt:string, filePath?: string, regenerateResponseId: number = 0): Promise<any[]> => {
    // const requestMessage: any[] = [{ role: "system", content: SYSTEM_PROMPTS.SUMMARIZE_MODEL }];
    const requestMessage: any[] = [{ role: "system", content: systemPrompt }];
    
    // Add previous conversation history if chatId exists
    if (chatId) {
        const previousHistory = await getPreviousConversationHistory(chatId, regenerateResponseId);
        
        if (previousHistory) {
            requestMessage.push(...previousHistory);
        }
    }

    // Prepare content for the current user input
    const contextContent = filePath
        ? [
              { type: "text", text: question },
              {
                  type: "image_url",
                  image_url: { url: `${ENV.APP_URL}/chat_image/${filePath}` },
              },
          ]
        : question;
    // Add the user input to the request message
    requestMessage.push({ role: "user", content: contextContent });

    return requestMessage;
};

export const streamOpenAIResponse = async (
    requestMessage: any,
    res: Response,
): Promise<{ fullResponse: string; usageInfo: any }> => {
    let fullResponse = "";
    let usageInfo = null;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: requestMessage,
        max_completion_tokens: Number(process.env.MAX_COMPLETION_TOKENS),
        temperature: 0.2,
        stream: true,
        stream_options: { include_usage: true },
    });

    for await (const chunk of response) {
        if (chunk?.usage) usageInfo = chunk.usage;
        if (chunk.choices && chunk.choices.length > 0) {
            const content = chunk.choices[0]?.delta?.content || "";
            fullResponse += content;
            res.write(`${JSON.stringify({ type: "Summary", data: content })}\n`);
        }
    }

    return { fullResponse, usageInfo };
};

export const handleTokenUsage = async (userId: number, requestMessage: any, fullResponse: string, usageInfo: any) => {
    let tokenResponse = usageInfo || await calculateUsedTokens(requestMessage, fullResponse);
    await saveOrUpdateTokenUsage(userId, tokenResponse.total_tokens);
    return tokenResponse;
};

export const processChatMetadata = async (chatId: number, fullResponse: string, userId: number) => {
    const chatData = await getChatData(chatId);

    if (!chatData) {
        logger.warn(`Chat not found for ID: ${chatId}`, {
            module: "ChatModule",
            sub_module: "Text to Text",
            userId: userId
        });
        return;
    }

    if (!chatData.title) {
        const titleResponse = await generateTitleAndDescription(fullResponse);
        logger.info("Generate title & description", {
            module: "ChatModule",
            sub_module: "Text to Text",
            userId: userId,
            request: fullResponse,
            response: titleResponse,
        });
        const titleContentObj = JSON.parse(titleResponse?.content || "{}");
        if (titleContentObj?.title || titleContentObj?.description) {
            await saveTitleAndDescription(chatId, titleContentObj.title, titleContentObj.description);

            logger.info("Saved title & description", {
                module: "ChatModule",
                sub_module: "Text to Text",
                userId: userId,
                request: titleContentObj
            });

            await customLogger.saveTokenUsageLog(userId, "Text to text : Generate title & Description", titleResponse?.total_tokens, fullResponse, JSON.stringify(titleResponse))
            logger.info("Saved Token Usage Log", {
                module: "ChatModule",
                sub_module: "Text to Text",
                userId: userId,
                request: titleContentObj
            });
        } else {
            logger.warn(`Title generation returned empty result`, {
                module: "ChatModule",
                sub_module: "Text to Text",
                userId: userId,
                chatId: chatId 
            });
        }
    }
};

// Text to text business logic :: END

// Mindmap, Flashcard, MCQ code :: START
export const generateContent = async (
    req: any,
    chatId: number,
    systemMessage: string,
    transcript: string,
    intent: string,
    type: "Mindmap" | "Flashcard" | "MCQ" | "Quicktest" | "TextFromImage"
): Promise<any> => {
    const userId = req.user!.id;
    const platform = req?.headers?.platform || "web"
    const regenerate_response_id = req.body.regenerate_response_id

    try {
        // Log: Starting Content Generation
        logger.info(`Starting ${type} generation`, {
            module: "ChatModule",
            userId,
            chatId,
            type,
            systemMessage,
            transcript
        });

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
                transcript = String(questionData?.message);
            }
        }


        // Step 1: Prepare Request
        const requestMessage = await prepareRequestMessage(chatId, transcript, systemMessage, filePath, regenerate_response_id);
        logger.info(`Prepared API request For ${type}`, {
            module: "ChatModule",
            sub_module: type,
            requestId: req.requestId || "N/A",
            chatId: chatId,
            requestMessage
        });

        // OpenAI API Call
        const response: any = await generateChatCompletion("gpt-4o-mini", systemMessage, transcript, 1);

        /* console.log('response :: ',response.choices[0].message.content.trim());
        return false; */
        logger.info(`OpenAI API called for ${type}`, {
            module: "ChatModule",
            userId,
            model: "gpt-4o-mini",
            prompt: { systemMessage, transcript },
            response
        });
        
        // Parse OpenAI Response
        const responseContent = response.choices[0].message.content.trim();
        const parsedData = JSON.parse(responseContent);

        const responseData: any = { type, data: {
            title: parsedData?.title,
            description: parsedData?.description,
            topic: parsedData?.topic,
            content: parsedData?.content,
            children: parsedData?.children,
            cards: parsedData?.cards
        }};

        // Save Generated Content
        const savedMessages: SavedMessages = await saveMessages(chatId, transcript, responseData, intent, req?.file?.filename);
        logger.info(`Saved ${type} content to chat`, {
            module: "ChatModule",
            userId,
            chatId,
            data: responseData,
            savedMessages: savedMessages
        });
        let quizData: any = "";
        let finalResponse = [];
        if(type == "MCQ" || type == "Quicktest"){
            quizData = await saveQuiz(savedMessages.responseId, responseContent);
            if(platform == 'app'){
                savedMessages['response']['message']['data']['data'] = quizData;
                savedMessages['response']['message'] = {...savedMessages['response']['message']['data']}
                savedMessages['response']['message'] = JSON.stringify(savedMessages['response']['message']);
            }else{
                savedMessages['response']['quizData'] = quizData;
            }
            logger.info(`Saved quiz in quizzes table`, {
                module: "ChatModule",
                userId,
                chatId,
                responseId: savedMessages.responseId,
                responseContent
            });
        }
        // return false;
        // Track Token Usage
        const totalTokensUsed = response?.usage?.total_tokens || 0;
        await saveOrUpdateTokenUsage(userId, totalTokensUsed);
        logger.info(`Token usage updated`, {
            module: "ChatModule",
            userId,
            totalTokensUsed
        });

        // Generate Title and Description if Missing
        const chatData: any = await getChatData(chatId);
        
        if (!chatData?.title) {
            const titleResponse = await generateTitleAndDescription(transcript);
            const titleContentObj = JSON.parse(titleResponse?.content || "{}");

            await saveTitleAndDescription(chatId, titleContentObj?.title, titleContentObj?.description);
            logger.info(`Generated and saved title/description`, {
                module: "ChatModule",
                userId,
                chatId,
                title: titleContentObj?.title,
                description: titleContentObj?.description
            });

            await customLogger.saveTokenUsageLog(userId, `${type} : Generate title & Description`, titleResponse?.total_tokens, transcript, JSON.stringify(titleResponse))
            logger.info("Saved Token Usage Log", {
                module: "ChatModule",
                sub_module: type,
                userId: userId,
                request: titleContentObj
            });
        }

        // Final Token Usage Update
        await updateTokenUsage(chatId, {
            total_tokens: totalTokensUsed,
            completion_tokens: response?.usage?.completion_tokens
        }, savedMessages);

        logger.info(`Updated token usage for ${type}`, {
            module: "ChatModule",
            userId,
            chatId,
            totalTokensUsed
        });
        
        logger.info(`Completed ${type} generation`, {
            module: "ChatModule",
            userId,
            chatId,
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

        return savedMessages.response;

    } catch (error: any) {
        logger.error(`Error generating ${type}`, {
            module: "ChatModule",
            userId: req.user!.id,
            chatId,
            message: error.message,
            stack: error.stack
        });
        throw new Error(`Failed to generate ${type}`);
    }
};

export const saveQuiz = async (messageId: number, quizData: string) => {
    if (!messageId || !quizData) return;
    try {
        const parsedData: ParsedQuizData = JSON.parse(quizData);
        
        if (!parsedData?.questions?.length) return;

        const insertData: any = await parsedData?.questions.map((question) => ({
            chat_message_id: messageId,
            question: question.question,
            options: question.options, // Store as JSON string
            correct_answer: question.correct_answer,
            explanation: question.explanation, // Assuming this field exists
            created_at: new Date(),
            updated_at: new Date(),
        }));
        console.log('insertData :: ',insertData);
        if (insertData.length > 0) {
            const insertResult = await AppDataSource.createQueryBuilder()
                .insert()
                .into(Quiz)
                .values(insertData)
                .returning(["id", "question", "options"])
                .execute();

            // Remove "explanation" if it appears in `generatedMaps`
            const formattedResult = insertResult.generatedMaps.map(({ explanation, ...rest }) => rest);
            return formattedResult;
        }
    } catch (error) {
        console.error("Error saving quiz:", error);
    }
}
// Mindmap, Flashcard and MCQ code :: START

export const saveMessages = async (chatId: Number, question: String, fullResponse: String, intent: String, filePath: string = "") => {
    if(chatId){
        let saveQuestion: any = "";
        let saveResponse: any = "";
        if(question){
            // Create and save the user message
            const chatMessage: any = new ChatMessage();
            chatMessage.chat_id = chatId;
            chatMessage.role = "user";
            chatMessage.message = question;
            if(filePath){
                chatMessage.files = filePath;
            }
            saveQuestion = await chatMessageRepository.save(chatMessage);
        }
    
        if(fullResponse){
            // Create and save the assistant message
            const chatMessage: any = new ChatMessage();
            chatMessage.chat_id = chatId;
            chatMessage.question_id = saveQuestion.id
            chatMessage.role = "assistant";
            chatMessage.message = fullResponse;
            chatMessage.intent = intent;
            saveResponse = await chatMessageRepository.save(chatMessage);
        }

        return {
            questionId: saveQuestion.id,
            responseId: saveResponse.id,
            response: saveResponse,
        };
    }

    return {
        questionId: 0,
        responseId: 0,
        response: null,
    };
}

export const updateTokenUsage = async (chatId: Number, tokenResponse: CalculatedUsedTokens, savedMessages: SavedMessages) => {

    const responseId: Number = savedMessages?.responseId
    const questionId: Number = savedMessages?.questionId
    const total_tokens: Number = tokenResponse?.total_tokens || 0
    await chatRepository.createQueryBuilder()
        .update(Chats)
        .set({
            used_tokens: () => `used_tokens + ${total_tokens}`,
            generate_summary_tokens: () => `generate_summary_tokens + ${total_tokens}`,
        })
        .where("id = :chatId", { chatId })
        .execute();
    
    if(responseId){
        const completion_tokens = tokenResponse?.completion_tokens || 0;
        await chatMessageRepository.createQueryBuilder()
        .update(ChatMessage)
        .set({
            used_tokens: () => `used_tokens + ${completion_tokens}`,
        })
        .where(`id = ${responseId}`)
        .setParameters({ completion_tokens })
        .execute();
    }
    if(questionId){
        const prompt_tokens = tokenResponse?.prompt_tokens || 0;
        await chatMessageRepository.createQueryBuilder()
        .update(ChatMessage)
        .set({
            used_tokens: () => `used_tokens + ${prompt_tokens}`,
        })
        .where(`id = ${questionId}`)
        .execute();
    }
    return true;
}

export const createChat = async (userId: number, title?: string, description?: string): Promise<Chats> => {
    const chat = new Chats();
    chat.user_id = userId;
    if(title){
        chat.title = title;
    }
    if(description){
        chat.description = description;
    }
    return chatRepository.save(chat);
};

export const fetchChatHistory = async (userId: number, page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit;

    try {
        const [totalChats, chatList] = await Promise.all([
            chatRepository.createQueryBuilder("chats")
                .where("chats.user_id = :userId", { userId })
                .getCount(),
            chatRepository.createQueryBuilder("chats")
                .select(["chats.id", "chats.created_at", "chats.title", "chats.description"])
                .where("chats.user_id = :userId", { userId })
                .orderBy("chats.created_at", "DESC")
                .skip(offset)
                .take(limit)
                .getRawMany(),
        ]);
        
        // Group chats by date
        const groupedChats: Record<string, any[]> = await chatList.reduce((acc, chat) => {
            const createdAt = moment(chat.chats_created_at);
            let groupKey = createdAt.isSame(moment(), 'day') ? 'Today' :
                           createdAt.isSame(moment().subtract(1, 'days'), 'day') ? 'Yesterday' :
                           createdAt.format("DD MMM YYYY");
            
            acc[groupKey] = acc[groupKey] || [];
            acc[groupKey].push({
                chat_id: chat.chats_id,
                title: chat.chats_title,
                description: chat.chats_description,
                time: createdAt.format("hh:mm A"),
            });

            return acc;
        }, {});
        
        return {
            success: true,
            data: groupedChats,
            pagination: {
                totalChats,
                currentPage: page,
                totalPages: Math.ceil(totalChats / limit),
                pageSize: limit,
            },
        };
    } catch (error: any) {
        throw new Error("Failed to fetch chat history.");
    }
};

export const getChatData = async (chatId: number): Promise<Chats | null> => {
    return chatRepository.findOneBy({ id: chatId });
};

export const getChatMessagesData = async (
    chatId: number,
    platform: string,
    page?: number,
    limit: number = 10
): Promise<{
    success: boolean;
    data: any[];
    pagination: {
        totalMessages: number;
        currentPage: number;
        totalPages: number;
        pageSize: number;
    };
}> => {
    try {
        // Get total messages count
        const totalMessages = await chatMessageRepository
            .createQueryBuilder("chat_messages")
            .where("chat_messages.chat_id = :chatId", { chatId })
            .getCount();

        // Calculate total pages
        const totalPages = Math.max(1, Math.ceil(totalMessages / limit));

        // Ensure currentPage is within bounds
        const currentPage = page ? Math.min(Math.max(1, page), totalPages) : totalPages;

        // Calculate offset for pagination
        const offset = (currentPage - 1) * limit;

        // Fetch messages for the current page
        const messages = await chatMessageRepository
            .createQueryBuilder("chat_messages")
            .select("*")
            .where("chat_messages.chat_id = :chatId", { chatId })
            .orderBy("chat_messages.id", "ASC") // Order from oldest to newest
            .skip(offset)
            .take(limit)
            .getRawMany();

        const quizRepository = AppDataSource.getRepository(Quiz);

        // **Fetch quiz data only for messages that match the intent**
        await Promise.all(
            messages.map(async (message, index) => {
                if (["MCQGeneration", "QuickTest"].includes(message.intent)) {
                    const messageId = message.id;

                    const quizData = await quizRepository
                        .createQueryBuilder("quizzes")
                        .select(["quizzes.id as id", "quizzes.question as question", "quizzes.options as options", "quizzes.users_answer as user_answer", "quizzes.explanation as explanation", "quizzes.is_correct as is_correct", "quizzes.correct_answer as correct_answer"])
                        .where("quizzes.chat_message_id = :messageId", { messageId })
                        .orderBy("quizzes.id", "ASC")
                        .getRawMany();

                        if(platform == "app"){
                            let messageContent = JSON.parse(message.message);
                            messageContent['data']['data'] = quizData
                            messages[index]['message'] = JSON.stringify({...messageContent['data']})
                            
                        }else{
                            // **Modify `quizData` to apply the required logic**
                            const formattedQuizData = quizData.map((quiz) => ({
                                ...quiz,
                                explanation: quiz.user_answer
                                    ? quiz.is_correct
                                        ? `<span class="correct-answer">Correct!</span> ${quiz.correct_answer} ${quiz.explanation ? quiz.explanation : ""}`
                                        : `<span class="incorrect-answer">Incorrect!</span> The correct answer is <span class="correct-answer">${quiz.correct_answer}</span>. ${quiz.explanation ? quiz.explanation : ""}`
                                    : null // Set `explanation` to `null` if `user_answer` is empty
                            }));
        
                            // Store quiz data in `quizData` field instead of overwriting `message`
                            messages[index]["quizData"] = formattedQuizData;
                        }

                } else {
                    messages[index]["quizData"] = []; // Ensure quizData is always available
                }
            })
        );

        // Return the paginated messages
        return {
            success: true,
            data: messages,
            pagination: {
                totalMessages,
                currentPage,
                totalPages,
                pageSize: limit,
            },
        };
    } catch (error) {
        console.error("Error fetching chat messages:", error);
        return {
            success: false,
            data: [],
            pagination: {
                totalMessages: 0,
                currentPage: 1,
                totalPages: 1,
                pageSize: limit,
            },
        };
    }
};

export const saveTitleAndDescription = async (chatId: any, title: String, description: String) => {
    if(chatId){
        const updateChatTitle: any = await chatRepository.findOneBy({id: chatId});
        updateChatTitle.title = title;
        updateChatTitle.description = description;
        return await AppDataSource.getRepository(Chats).save(updateChatTitle);
    }

    return false;
}

/* Update Reaction Status in Chat Message */
export const updateReactionStatus = async (
    messageId: number,
    reactionStatus: "like" | "dislike" | null
): Promise<ChatMessage | null> => {
    try {
        const chatMessageRepository = AppDataSource.getRepository(ChatMessage);

        // Find the chat message by ID
        const message = await chatMessageRepository.findOneBy({ id: messageId });

        if (!message) {
            logger.warn("Chat message not found during reaction update", {
                module: "ChatModule",
                messageId,
            });
            return null; // Message not found
        }

        // Update reaction status
        message.reaction_status = reactionStatus;
        const updatedMessage = await chatMessageRepository.save(message);

        logger.info("Reaction status updated in database", {
            module: "ChatModule",
            messageId,
            reactionStatus,
        });

        return updatedMessage;
    } catch (error: any) {
        console.log('error :: ',error);
        logger.error("Error updating reaction status in service", {
            module: "ChatModule",
            messageId,
            error: error.message,
        });
        throw new Error("Failed to update reaction status.");
    }
};

export const updateResponse = async (
    messageId: number,
    response: string
): Promise<ChatMessage | null> => {
    try {
        // Find the chat message by ID
        const message = await chatMessageRepository.findOneBy({ id: messageId });

        if (!message) {
            logger.warn("Chat message not found during reaction update", {
                module: "ChatModule",
                messageId,
            });
            return null; // Message not found
        }

        // Update response message
        message.message = response;
        const updatedMessage = await chatMessageRepository.save(message);

        logger.info("Update response status", {
            module: "ChatModule",
            messageId,
            response,
            updatedMessage
        });

        return updatedMessage;
    } catch (error: any) {
        logger.error("Error updating response of chat message", {
            module: "ChatModule",
            messageId,
            error: error.message,
        });
        throw new Error("Failed to update reaction status.");
    }
};

export const saveOrUpdateTokenUsage = async (userId: number, tokens: any) => {
    const userTokenUsageRepository: any = AppDataSource.getRepository(UserTokenUsage);

    const usageDate = moment().format("YYYY-MM-DD"); // Format as YYYY-MM-DD

    // Check if a record already exists for the user and date
    let usage = await userTokenUsageRepository.findOneBy({ user_id: userId, usage_date: usageDate });

    if (usage) {
        // Update the token count
        usage.tokens_used = Number(usage.tokens_used) + Number(tokens);
    } else {
        // Create a new record
        usage = userTokenUsageRepository.create({
            user_id: userId,
            usage_date: usageDate,
            tokens_used: tokens,
        });
    }

    return userTokenUsageRepository.save(usage);
};

export const getMessagesData = async (messageId: any) => {

    const chatMessageRepository = AppDataSource.getRepository(ChatMessage);

    const message = await chatMessageRepository.findOneBy({ id: messageId });
    if (!message) {
        return null; // Message not found
    }

    return message
};

/* Get Remaining Queries for a User */
export const getRemainingQueriesData = async (userId: number): Promise<number> => {
    try {
        logger.info("Fetching chat data for remaining queries", { userId });

        // Get all chat IDs for the user
        const chatIds = await chatRepository
            .createQueryBuilder("chat")
            .select("chat.id")
            .where("chat.user_id = :userId", { userId })
            .getRawMany();

        // If no chats exist
        if (chatIds.length === 0) {
            logger.info("No chats found for user", { userId });
            return 0;
        }

        const today = moment().format("YYYY-MM-DD");

        // Count today's user messages across chats
        const totalMessages = await chatMessageRepository
            .createQueryBuilder("chat_messages")
            .where("chat_messages.role = :role", { role: "user" })
            .andWhere("chat_messages.chat_id IN (:...chatIds)", {
                chatIds: chatIds.map(chat => chat.id),
            })
            .andWhere("DATE(chat_messages.created_at) = :today", { today })
            .getCount();

        logger.info("Remaining queries calculated", { userId, totalMessages });

        return totalMessages;
    } catch (error: any) {
        logger.error("Error fetching remaining queries", {
            userId,
            error: error.message,
        });
        throw new Error("Failed to fetch remaining queries.");
    }
};

export const validateLimitRequest = async (userId: number): Promise<{ status: boolean; message?: string }> => {
    const queriesLimit = await getRemainingQueriesData(userId);
    const queryLimit = ENV.QUERY_USAGE_LIMIT;

    return queriesLimit >= queryLimit
        ? { status: false, message: `You have reached your daily query limit of ${queryLimit}.` }
        : { status: true };
};

// Soft delete chat securely
export const deleteChatData = async (chatId: number) => {
    return await chatRepository
        .createQueryBuilder()
        .softDelete()
        .where("id = :chatId", { chatId })
        .execute();
};

// Get specific message data
export const getChatMessage = async (responseId: number) => {
    
    const chatMessageRepository = AppDataSource.getRepository(ChatMessage);

    const message = await chatMessageRepository.findOneBy({ id: responseId });
    if (!message) {
        return null; // Message not found
    }

    return message
};

// Soft delete chat securely
export const deleteQuestionAndResponse = async (
    responseId?: number,
    questionId?: number,
    newResponseId?: number
): Promise<{ questionDeleted: boolean; responseDeleted: boolean; quizDeleted: boolean }> => {
    if (!responseId && !questionId) {
        throw new Error("Either responseId or questionId must be provided.");
    }

    // Use Transaction to ensure atomicity (Only for PostgreSQL)
    return await AppDataSource.transaction(async (entityManager: EntityManager) => {
        let questionDeleted = false;
        let responseDeleted = false;
        let quizDeleted = false;

        try {
            // Delete Question if `questionId` is provided
            if (questionId) {
                const deleteQuestionResult = await entityManager.delete(ChatMessage, { id: questionId });
                questionDeleted = Boolean(deleteQuestionResult.affected && deleteQuestionResult.affected > 0);
            }

            // If `responseId` exists, perform multiple actions
            if (responseId) {
                // Delete the response message
                const deleteResponseResult = await entityManager.delete(ChatMessage, { id: responseId });
                responseDeleted = Boolean(deleteResponseResult.affected && deleteResponseResult.affected > 0);

                // Update `message_id` in `Directories` table if `responseId` exists
                await entityManager.update(
                    Directories,
                    { message_id: responseId },
                    { message_id: newResponseId }
                );

                // Delete associated quiz questions
                const deleteQuizResult = await entityManager.delete(Quiz, { chat_message_id: responseId });
                quizDeleted = Boolean(deleteQuizResult.affected && deleteQuizResult.affected > 0);
            }

            return {
                questionDeleted,
                responseDeleted,
                quizDeleted
            };
        } catch (error) {
            console.error("Error in deleteQuestionAndResponse:", error);
            throw new Error("Failed to delete records.");
        }
    });
};

export const checkAnswerCorrectOrNot = async (questionId: number, answer: string) => {
    const quizRepository = AppDataSource.getRepository(Quiz);
    const quiz = await quizRepository.findOneBy({ id: questionId });
    if (!quiz) {
        return {
            status: false,
            message: "Question not found",
        };
    }

    const isCorrect = quiz.correct_answer === answer;

    quiz.users_answer = answer;
    quiz.is_correct = isCorrect;
    const savedQuiz = await quizRepository.save(quiz);
    return {
        status: isCorrect,
        message: isCorrect 
            ? '<span class="correct-answer">Correct!</span>' 
            : `<span class="incorrect-answer">Incorrect!</span> The correct answer is <span class="correct-answer">${quiz.correct_answer}</span>.`,
        explanation: `${!isCorrect ? `<span class="correct-answer">${quiz.correct_answer}</span>` : ""} ${quiz.explanation}`,
        message_id: Number(quiz.chat_message_id),
    };
};

export const generateResult = async (messageID: number) => {
    try {
        const quizRepository = AppDataSource.getRepository(Quiz);
        logger.info(`Starting result generation for Message ID: ${messageID}`, {
            module: "QuizModule",
            sub_module: "ResultGeneration",
            messageID
        });

        // Fetch chat message
        const messageData = await chatMessageRepository
            .createQueryBuilder("chatMessage")
            .select(["chatMessage.intent as intent", "chatMessage.message as message"])
            .where("chatMessage.id = :messageID", { messageID })
            .getRawOne();

        if (!messageData) {
            logger.warn(`Chat message not found for ID: ${messageID}`, {
                module: "QuizModule",
                sub_module: "ResultGeneration",
                messageID
            });
            return null;
        }

        // Determine system message prompt
        const systemMessage = messageData.intent === "QuickTest" ? PROMPT.QuickTestResult : PROMPT.MCQGenerationResult;

        // Fetch quiz results
        const quizResults = await quizRepository
            .createQueryBuilder("quiz")
            .select(["*"])
            .where("quiz.chat_message_id = :messageID", { messageID })
            .orderBy("quiz.id", "ASC")
            .getRawMany();

        if (quizResults.length === 0) {
            logger.warn(`No quiz results found for Message ID: ${messageID}`, {
                module: "QuizModule",
                sub_module: "ResultGeneration",
                messageID
            });
            return null;
        }
        
        // Calculate quiz stats
        const { totalQuestions, attemptedQuestions, correctAnswers } = quizResults.reduce(
            (acc, q) => {
                acc.totalQuestions += 1;
                if (q.is_correct !== null) acc.attemptedQuestions += 1;
                if (q.is_correct === true) acc.correctAnswers += 1;
                return acc;
            },
            { totalQuestions: 0, attemptedQuestions: 0, correctAnswers: 0 }
        );

        logger.info(`Calculated quiz stats for Message ID: ${messageID}`, {
            module: "QuizModule",
            sub_module: "ResultGeneration",
            messageID,
            totalQuestions,
            attemptedQuestions,
            correctAnswers
        });

        // Parse message content only if it exists and is not empty
        const message = messageData.message ? JSON.parse(messageData.message) : {};
        
        // Construct the transcript prompt
        const transcript = `Analyze the following **Test results** and generate structured performance feedback in JSON format.

        ### **Topic:** ${message?.data?.topic || "Unknown Topic"}
        ### **Test Summary:**
        - **Total Questions:** ${totalQuestions}
        - **Attempted Questions:** ${attemptedQuestions}
        - **Correct Answers:** ${correctAnswers}`;

        logger.info(`Sending request to AI for Message ID: ${messageID}`, {
            module: "QuizModule",
            sub_module: "ResultGeneration",
            messageID,
            systemMessage,
            transcript
        });
        // log
        // Call AI to generate the result
        const response: any = await generateChatCompletion("gpt-4o-mini", systemMessage, transcript, 1);

        // Extract and validate AI response
        const aiResponseContent = response?.choices?.[0]?.message?.content?.trim();
        if (!aiResponseContent) {
            logger.error(`AI response missing for Message ID: ${messageID}`, {
                module: "QuizModule",
                sub_module: "ResultGeneration",
                messageID,
                response
            });
            return null;
        }

        // Save quiz result in `chat_messages` table
        await chatMessageRepository
            .createQueryBuilder()
            .update()
            .set({ quiz_result: aiResponseContent })
            .where("id = :messageID", { messageID })
            .execute();

        logger.info(`Successfully saved quiz result for Message ID: ${messageID}`, {
            module: "QuizModule",
            sub_module: "ResultGeneration",
            messageID,
            result: aiResponseContent
        });

        let finalResponse = JSON.parse(aiResponseContent);
        finalResponse['quizData'] = quizResults;
        // Return quiz result to API
        return finalResponse
        
    } catch (error: any) {
        logger.error(`Error generating result for Message ID: ${messageID}`, {
            module: "QuizModule",
            sub_module: "ResultGeneration",
            messageID,
            message: error.message,
            stack: error.stack
        });
        throw new Error(`Failed to generate result: ${error.message}`);
    }
};

export const fetchTranscript = async (videoUrl: string) => {
    try {
        // const transcript = await getTranscript.(videoUrl, { lang: "en" });
        const transcript = await YoutubeTranscript.fetchTranscript(videoUrl)

        // Ensure transcript exists and format it properly
        if (!transcript || transcript.length === 0) {
            throw new Error("No transcript found.");
        }

        // Return formatted transcript as a string
        return transcript.map((item: { text: string }) => item.text).join(" ");
        
        // return transcript.map(item => item.text).join(" "); 
    } catch (error) {
        console.log('error :: ',error);
        return "No transcript available.";
    }
}

export const saveConversation = async (conversation: AudioConversation[], userId: number): Promise<number> => {
    try {
        if (!conversation || conversation.length === 0) {
            throw new Error("No conversation data provided.");
        }

        // Extract conversation history
        const communicationHistory = conversation
            .map((msg: AudioConversation) => `${msg.role}: ${msg.message.trim()}`)
            .join("\n");

        // Generate title & description
        const titleResponse = await generateTitleAndDescription(communicationHistory);
        const titleContentObj = JSON.parse(titleResponse?.content || "{}");

        // Create a new chat record
        const chat = await createChat(userId, titleContentObj?.title, titleContentObj?.description);
        const chatId = chat?.id;

        logger.info("Generated and saved title/description", {
            module: "ChatModule",
            userId,
            chatId,
            title: titleContentObj?.title,
            description: titleContentObj?.description,
        });

        // Log token usage
        await customLogger.saveTokenUsageLog(
            userId,
            "Generate title & Description of Audio Conversation",
            titleResponse?.total_tokens,
            communicationHistory,
            JSON.stringify(titleResponse)
        );

        logger.info("Saved Token Usage Log", {
            module: "Audio",
            sub_module: "Audio to Audio",
            userId,
            chatId,
            request: titleContentObj,
        });

        // Prepare chat messages for bulk insert
        const chatMessages = conversation.map((msg) => ({
            chatId, // Associate with the new chat
            userId,
            role: msg.role,
            message: msg.message.trim(),
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        // Bulk insert messages
        await chatMessageRepository.insert(chatMessages);

        logger.info("Saved conversation messages", {
            module: "ChatModule",
            userId,
            chatId,
            messagesCount: chatMessages.length,
        });

        return chatId;
    } catch (error: any) {
        logger.error("Error while saving conversation", {
            module: "ChatModule",
            userId,
            message: error.message,
            stack: error.stack,
        });
        throw new Error("Failed to save conversation");
    }
};
