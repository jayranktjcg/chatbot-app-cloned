import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Colors from '../../Helper/Colors';
import AudioToAudio from "../../assets/icons/speakerIcon.svg";

function AudioButton({ startSession }) {
  const navigate = useNavigate();

  const handleClick = async () => {
    await startSession(); // Ensure the session starts
     // Redirect to the route
  };

  return (
    <Button
      variant="contained"
      sx={{
        marginRight: "8px",
        backgroundColor: Colors.white,
        borderRadius: "50%",
        width: { xs: "35px", md: "40px" },
        minWidth: { xs: "35px", md: "40px" },
        height: { xs: "35px", md: "40px" },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        "&:hover": {
          backgroundColor: Colors.bgLightGrey,
          color: Colors.black,
        },
      }}
      onClick={handleClick}
    >
      <img
        src={AudioToAudio}
        style={{ height: "17px", cursor: "pointer" }}
        alt="Audio Session"
      />
    </Button>
  );
}

export default AudioButton;
