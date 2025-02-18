import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingLayout from "../layouts/LandingLayout";
import ChatBotLayout from "../layouts/ChatBotLayout";
import PrivateRoute from "./PrivateRoute";
import MindmapPage from "../components/chatbot/MindmapPage";
import FlashcardPage from "../components/chatbot/FlashcardPage";
import VoiceAssistant from "../components/audiotoaudio/VoiceAssistant";
import CreateFolderDialog from "../components/directory/CreateFolderDialog";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingLayout />} />
      <Route
        path="/chatbot"
        element={
          <PrivateRoute>
            <ChatBotLayout />
          </PrivateRoute>
        }
      />
      <Route
        path="/chatbot/:chat_id"
        element={
          <PrivateRoute>
            <ChatBotLayout />
          </PrivateRoute>
        }
      />
      <Route
        path="/directory"
        element={
          <PrivateRoute>
            <CreateFolderDialog />
          </PrivateRoute>
        }
      />
      <Route
        path="/audiotoaudio"
        element={
          <PrivateRoute>
            <VoiceAssistant />
          </PrivateRoute>
        }
      />
      <Route
        path="/mindmap/:id"
        element={
          <PrivateRoute>
            <MindmapPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/flashcard/:id"
        element={
          <PrivateRoute>
            <FlashcardPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
