import { AppDataSource } from "@Config/connection";
import { TokenUsageLog } from "@Entity/TokenUsageLog";

const saveTokenUsageLog =  async (
    userId: number,
    module: string,
    tokensUsed: number,
    request?: string,
    response?: string
) => {
    try {
        const tokenUsageLogRequest: any = new TokenUsageLog();
        tokenUsageLogRequest.user_id = userId;
        tokenUsageLogRequest.module = module;
        tokenUsageLogRequest.tokens_used = tokensUsed;
        tokenUsageLogRequest.request = request ? JSON.stringify(request) : null;
        tokenUsageLogRequest.response = response ? JSON.stringify(response) : null;
        return await AppDataSource.getRepository(TokenUsageLog).save(tokenUsageLogRequest);

    } catch (error) {
        console.error("Failed to save token usage log:", error);
        throw error; // Re-throw the error if needed for further handling
    }
}

export const customLogger = {
    saveTokenUsageLog
}