import { DataSource } from "typeorm";
import { ENV } from "./env";
import User from "@Entity/User";
import { Chats } from "@Entity/Chats";
import { ChatMessage } from "@Entity/ChatMessage";
import { SummaryLog } from "@Entity/SummaryLog";
import { Jobs } from "openai/resources/fine-tuning/jobs/jobs";
import { UserTokenUsage } from "@Entity/UserTokenUsage";
import { Directories } from "@Entity/Directories";
import { TokenUsageLog } from "@Entity/TokenUsageLog";
import { Quiz } from "@Entity/Quizzes";
import Subscription from "@Entity/Subscription";
import Plans from "@Entity/Plans";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: ENV.DATABASE_HOST,
    port: Number(ENV.DATABASE_PORT),
    username: ENV.DATABASE_USER,
    password: ENV.DATABASE_PASSWORD,
    database: ENV.DATABASE_NAME,
    synchronize: false, // Set to true only for development
    // logging: ["query", "error"], // true for the query log
    logging: false, // true for the query log
    entities: [
        User,
        Chats,
        ChatMessage,
        SummaryLog,
        Jobs,
        UserTokenUsage,
        Directories,
        TokenUsageLog,
        Subscription,
        Plans,
        Quiz
    ], // Ensure User is included here
});
