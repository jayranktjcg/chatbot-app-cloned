import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Typography, Box } from "@mui/material";
import Colors from '../../Helper/Colors';
import FileUploadIcon from "../../assets/icons/fileUploadIcon.svg";
import CircleCheck from "../../assets/icons/circleCheck.svg";
import XCloseWhite from "../../assets/icons/XCloseWhite.svg";
import "katex/dist/katex.min.css";
import Markdown from '../chatbot/markdowncomponents/Markdown';

const FilePreviewModal = ({ open, onClose, file }) => {
  const [parsedMessage, setParsedMessage] = useState(null);

  useEffect(() => {
    if (!file?.message) return;
  
    let messageData = {};
  
    if (typeof file.message === "string") {
      try {
        messageData = JSON.parse(file.message);
      } catch (error) {
        messageData = { type: "PlainText", content: file.message };
      }
    } else if (typeof file.message === "object") {
      try {
        messageData = typeof file.message.message === "string" && file.message.message.trim().startsWith("{")
          ? JSON.parse(file.message.message)
          : { type: "PlainText", content: file.message.message };
      } catch (error) {
        messageData = { type: "PlainText", content: file.message.message };
      }
    }
  
    setParsedMessage(messageData);
  }, [file]);
  
  const { intent } = file || {};

  if (intent === "QuickTest" || intent === "MCQ") {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle sx={{ borderBottom: Colors.borderUserMessage, mb: 2, p: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', height: '65px' }}>
          <Typography sx={{ flexGrow: 1, textAlign: 'center', color: Colors.black, fontWeight: 600, fontSize: '24px' }}>
            {file?.name}
          </Typography>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              marginRight: '8px', backgroundColor: Colors.black, borderRadius: '50%',
              width: { xs: '35px', md: '40px' }, minWidth: { xs: '35px', md: '40px' }, height: { xs: '35px', md: '40px' },
              display: 'flex', justifyContent: 'center', alignItems: 'center', "&:hover": { backgroundColor: Colors.black, color: Colors.white }
            }}
          >
            <img src={XCloseWhite} alt="Close" style={{ height: '20px', cursor: 'pointer' }} />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent className="messageBoxWrap">
        {parsedMessage?.type === "Mindmap" ? (
          <Box sx={{ maxWidth: '450px', mb: 1 }}>
            <Box sx={{
              backgroundColor: Colors.AiBgColor,
              color: Colors.black,
              borderRadius: '20px',
              padding: '12px',
              wordBreak: 'break-word',
              overflow: 'hidden',
              display: 'block',
            }}>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                {parsedMessage.data.description || "Mindmap generated successfully."}
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap', my: "16px !important" }}>
                Here's your file!
              </Typography>
              <Box
                sx={{ border: Colors.FlashCardBorderColor, p: 1.5, background: Colors.white, borderRadius: '15px', cursor: 'pointer' }}
                onClick={() => {
                  const url = `/mindmap?id=${file.message_id}`;
                  window.open(url, "_blank");
                }}
                                                                                                        
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', gap: 2 }}>
                      <img
                          src={FileUploadIcon}
                          style={{
                              height: '35px', cursor: 'pointer',
                          }}
                      />
                      <Box>
                          <Typography>{parsedMessage?.data?.title || "Mindmap"}</Typography>
                          {/* <Typography>200 KB</Typography> */}
                      </Box>
                  </Box>
                  <img
                      src={CircleCheck}
                      style={{
                          height: '20px', cursor: 'pointer',
                      }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        ) : parsedMessage?.type === "Flashcard" ? (
           <Box sx={{ maxWidth: '450px', mb: 1 }}>
            <Box sx={{
              backgroundColor: Colors.AiBgColor,
              color: Colors.black,
              borderRadius: '20px',
              padding: '12px',
              wordBreak: 'break-word',
              overflow: 'hidden',
              display: 'block',
            }}>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                {parsedMessage.data.description || "Flashcard generated successfully."}
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap', my: "16px !important" }}>
                Here's your file!
              </Typography>
              <Box
                sx={{ border: Colors.FlashCardBorderColor, p: 1.5, background: Colors.white, borderRadius: '15px', cursor: 'pointer' }}
                onClick={() => {
                  const url = `/flashcard?id=${file.message_id}`;
                  window.open(url, "_blank");
                }}
                                                                                                      
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', gap: 2 }}>
                      <img
                          src={FileUploadIcon}
                          style={{
                              height: '35px', cursor: 'pointer',
                          }}
                      />
                      <Box>
                          <Typography>{parsedMessage?.data?.title || "Flashcard"}</Typography>
                          {/* <Typography>200 KB</Typography> */}
                      </Box>
                  </Box>
                  <img
                      src={CircleCheck}
                      style={{
                          height: '20px', cursor: 'pointer',
                      }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (intent === "Summary" || intent === "General" || intent === "ConceptExplanation") ? (
          console.log('This One'),
          <Markdown content={file?.message?.message} />
        ) : (
          <Markdown content={file?.message?.message} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewModal;
