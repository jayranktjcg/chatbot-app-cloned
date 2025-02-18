import React from "react";
import AudioButton from "./AudioButton";

function SessionControls({
  startSession,
  stopSession,
  sendClientEvent,
  sendTextMessage,
  isSessionActive,
}) {
  return (
    <div className="flex gap-4 border-t-2 border-gray-200 h-full rounded-md">
      {isSessionActive ? (
        <div className="flex gap-4">
          <button onClick={stopSession} className="bg-red-500 p-2 text-white">
            Stop Session
          </button>
        </div>
      ) : (
        <AudioButton startSession={startSession} />
      )}
    </div>
  );
}

export default SessionControls;
