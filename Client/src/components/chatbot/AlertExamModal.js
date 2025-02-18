import React, { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

const AlertExamModal = ({ isQuickTestActive, handleStopQuickTest }) => {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const wasExamRunning = sessionStorage.getItem("exam_running") === "true";

        if (wasExamRunning && !isQuickTestActive) {
            setShowModal(true);
        }
    }, []);

    useEffect(() => {
        if (isQuickTestActive) {
            sessionStorage.setItem("exam_running", "true"); // ✅ Store flag when test starts
        } else {
            sessionStorage.removeItem("exam_running"); // ✅ Remove flag when test is completed
        }
    }, [isQuickTestActive]);

    const handleShowResult = () => {
        handleStopQuickTest(); // ✅ Stop the test and fetch the result
        setShowModal(false);
        sessionStorage.removeItem("exam_running"); // ✅ Clear the flag after stopping the test
    };

    return (
        <Dialog open={showModal} onClose={() => setShowModal(false)}>
            <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
                Exam in Progress 🚀
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ textAlign: "center" }}>
                    You were in the middle of an exam before the page was refreshed. Would you like to stop the test and view the result?
                </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleShowResult}
                >
                    Show Result
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AlertExamModal;
