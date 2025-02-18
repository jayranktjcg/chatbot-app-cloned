import { Router } from "express";
import userRoutes from "@Modules/users/user.routes"; // Import user-related routes
import chatRoutes from "@Modules/chats/chats.routes"; // Import chat-related routes
import cronRoutes from "@Modules/cronjobs/cronjob.routes"; // Import cron-related routes
// import intentRoutes from "@Modules/IntentChecker/IntentChecker.routes"; // Import cron-related routes
import directoryRoutes from "@Modules/directory/directory.routes"; // Import cron-related routes

const router = Router();

// Register sub-routes
router.use("/users", userRoutes); //isAuthenticatedUser use this for the authentication

router.use("/chats", chatRoutes);

router.use("/cron", cronRoutes);

// router.use("/intent", intentRoutes);

router.use("/directory", directoryRoutes);



export default router;
