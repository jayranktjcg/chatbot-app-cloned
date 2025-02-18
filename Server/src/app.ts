import * as dotenv from "dotenv";
dotenv.config();

import "reflect-metadata"; // Required by TypeORM
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { AppDataSource } from "@Config/connection";

import routes from "./routes";
import { ENV } from "@Config/env";
import fs from "fs";
import requestIdMiddleware from "@Middleware/requestId";

const app = express();
const PORT = ENV.APP_PORT;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, "..", '/views'));

// Middleware
app.use(cors());
app.use(express.json());

app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));

// ✅ Attach Request ID to every request
app.use(requestIdMiddleware);

// Register all routes
app.use("/api", routes);


app.use('/chat_image', express.static(path.join(__dirname, '../uploads/context-images')));

// Initialize TypeORM and Start Server
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error: any) => {
        console.error("Error during Data Source initialization:", error);
    });
