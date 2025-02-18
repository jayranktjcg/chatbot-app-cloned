import { AppDataSource } from "@Config/connection";
import { ENV } from "@Config/env";
import { ChatMessage } from "@Entity/ChatMessage";
import { Chats } from "@Entity/Chats";
import { SummaryLog } from "@Entity/SummaryLog";
import { generateSummary } from "@Utils/openai.api";
import { fetchNewMessages } from "@Modules/chats/chats.service";
import logger from "@Utils/winston.logger";

const chatRepository = AppDataSource.getRepository(Chats);
const summaryLogRepository = AppDataSource.getRepository(SummaryLog);
const chatMessageRepository = AppDataSource.getRepository(ChatMessage);

/**
 * Handles the entire summary generation process for eligible chats
 */
export const processChatSummaries = async (): Promise<void> => {
    logger.info("Starting chat summary cron job", { module: "CronJobModule" });

    const chatsToProcess = await fetchEligibleChats();
    
    
    if (chatsToProcess.length === 0) {
        logger.info("No chats found for summary generation", { module: "CronJobModule" });
        return;
    }
    
    await generateSummariesForChats(chatsToProcess);
    logger.info("Generated Summary", { chatsToProcess });
};

/**
 * Fetch chats eligible for summary generation
 */
const fetchEligibleChats = async (): Promise<any[]> => {
    logger.info("Fetching chats eligible for summary", { module: "CronJobModule" });

    return chatRepository.createQueryBuilder("c")
        .select([
            "c.id AS id",
            "c.summary AS summary",
            "c.user_id AS userId",
            "c.last_message_id AS last_message_id",
            "c.generate_summary_tokens AS summary_token",
            "COALESCE(m.new_message_count, 0) AS new_message_count",
            // Add the condition as a calculated column
            `CASE 
                WHEN c.generate_summary_tokens >= :tokens THEN 'tokens'
                WHEN COALESCE(m.new_message_count, 0) >= :messageCount THEN 'messageCount'
                ELSE NULL
            END AS reason`,
        ])
        .leftJoin(
            (qb) =>
                qb.subQuery()
                    .select("m.chat_id", "chat_id")
                    .addSelect("COUNT(*)", "new_message_count")
                    .from(ChatMessage, "m")
                    .where("m.id > (SELECT chats.last_message_id FROM chats WHERE chats.id = m.chat_id)")
                    .groupBy("m.chat_id"),
            "m",
            "c.id = m.chat_id"
        )
        .where("c.generate_summary_tokens >= :tokens OR COALESCE(m.new_message_count, 0) >= :messageCount", {
            tokens: ENV.GENERATE_SUMMARY_TOKEN,
            messageCount: ENV.GENERATE_SUMMARY_QUESTION,
        })
        .orderBy("c.id", "ASC")
        .getRawMany();
};

/**
 * Generate summaries for the provided chats
 */
const generateSummariesForChats = async (chats: any[]): Promise<void> => {
    await Promise.all(chats.map(async (chat) => {
        try {
            const historyRequest = await buildChatHistory(chat);
            
            
            logger.info(`Building chat history for Chat ID: ${chat.id}`, { 
                module: "CronJobModule",
                response: historyRequest
            });
            const summaryResponse = await generateSummary(historyRequest.history);

            if (summaryResponse) {
                summaryResponse['reason'] = chat.reason
                summaryResponse['newLastMessageId'] = historyRequest.last_message_id
                logger.info(`Summary generated for Chat ID: ${chat.id}`, { 
                    module: "CronJobModule",
                    response: summaryResponse
                });
                await saveGeneratedSummary(chat.id, summaryResponse, chat.userId);
            }
        } catch (error: any) {
            logger.error(`Error generating summary for Chat ID: ${chat.id}`, {
                module: "CronJobModule",
                message: error.message,
            });
        }
    }));
};

/**
 * Build conversation history for summary generation
 */
const buildChatHistory = async (chat: any): Promise<{ history: string[]; last_message_id: number }> => {
    const previousSummary = chat.summary || "";
    const newMessages = await fetchNewMessages(chat.id, chat.last_message_id);

    // Prepare the history array
    const history = [
        ...(previousSummary ? [{ role: "assistant", content: previousSummary }] : []),
        ...newMessages.map((msg) => ({
            role: msg.role,
            content: msg.files
                ? [
                    `Text: ${msg.message}`,
                    `Image URL: ${ENV.APP_URL}/chat_image/${msg.files}`,
                ].join("\n")
                : msg.message,
        })),
    ];

    // Convert to plain string format for tokens
    const formattedHistory = history.map((msg) =>
        `${msg.role}: ${typeof msg.content === "string" ? msg.content.trim() : msg.content}`
    );

    // Find the last_message_id from newMessages
    const lastMessageId = newMessages.length > 0 ? newMessages[newMessages.length - 1].id : chat.last_message_id;
    return {
        history: formattedHistory,
        last_message_id: lastMessageId,
    };
};



/**
 * Save the generated summary and log it
 */
const saveGeneratedSummary = async (chatId: number, summaryResponse: any, userId: number): Promise<void> => {
    logger.info(`Saving Generated Summary for Chat ID: ${chatId}`, { 
        module: "CronJobModule",
        summaryResponse: summaryResponse,
        userId: userId
    });
    const summaryText = summaryResponse?.choices[0]?.message?.content;

    // Update chat summary
    await chatRepository.update(chatId, {
        summary: summaryText,
        last_summary_timestamp: new Date(),
        generate_summary_tokens: 0,
        last_message_id: summaryResponse.newLastMessageId
    });

    // Save to SummaryLog
    const chatReference = AppDataSource.getRepository(Chats).create({ id: chatId });
    const summaryLog = new SummaryLog();
    summaryLog.chat = chatReference;  // Correctly assigning a Chats entity reference
    summaryLog.summary = summaryText;
    summaryLog.reason = summaryResponse.reason || "token";
    summaryLog.used_tokens = summaryResponse?.usage?.total_tokens;

    await summaryLogRepository.save(summaryLog);

    logger.info(`Summary saved for Chat ID: ${chatId}`, { module: "CronJobModule" });

    // Track token usage
    logger.info("Saving token usage log", {
        module: "CronJobModule",
        userId,
        tokensUsed: summaryResponse?.usage?.total_tokens
    });
};
