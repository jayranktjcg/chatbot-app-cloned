import { useState } from "react";
import { Dialog, DialogContent, Button } from "@mui/material";
import ButtonView from "./Button";
import AudioComponent from "../chatbot/AudioToAudio"; // Import your full AudioComponent
import Colors from "../../Helper/Colors";
import AudioToAudio from "../../assets/icons/speakerIcon.svg";


function SessionStopped({ startSession }) {
  const [isActivating, setIsActivating] = useState(false);

  function handleStartSession() {
    if (isActivating) return;

    setIsActivating(true);
    startSession(); // Trigger the start session logic
  }

  return (
    <Button
      onClick={handleStartSession}
      variant="contained"
      sx={{ backgroundColor: Colors.transparent, borderRadius: '50%', width: { xs: '35px', md: '40px' }, minWidth: { xs: '35px', md: '40px' }, height: { xs: '35px', md: '40px' }, display: 'flex', justifyContent: 'center', alignItems: 'center', "&:hover": { backgroundColor: Colors.transparent, color: Colors.transparent } }}
    >
      <img
        src={AudioToAudio}
        style={{ height: '42px', cursor: 'pointer' }}
      />
    </Button>
  );
}

export default function SessionControls({ startSession, stopSession, isSessionActive, disabled }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartSession = () => {
    setIsModalOpen(true); // Open the modal
    startSession(); // Trigger session start logic
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
    stopSession(); // Disconnect the session
  };

  return (
    <div className="flex gap-4 border-t-2 border-gray-200 h-full rounded-md">
      {isSessionActive ? (
        <div className="flex items-center justify-center w-full h-full">
          <Button
            onClick={stopSession}
            disabled={disabled}
            variant="contained"
            sx={{ backgroundColor: Colors.transparent, borderRadius: '50%', width: { xs: '35px', md: '40px' }, minWidth: { xs: '35px', md: '40px' }, height: { xs: '35px', md: '40px' }, display: 'flex', justifyContent: 'center', alignItems: 'center', "&:hover": { backgroundColor: Colors.transparent, color: Colors.transparent } }}
          >
            <img
              src={AudioToAudio}
              style={{ height: '42px', cursor: 'pointer' }}
            />
          </Button>
        </div>
      ) : (
        <SessionStopped startSession={() => !disabled && handleStartSession()} />
      )}

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullScreen>
        <DialogContent sx={{ m: 0, p: 0 }}>
          {/* Pass handleCloseModal to the AudioComponent */}
          <AudioComponent onClose={handleCloseModal} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
