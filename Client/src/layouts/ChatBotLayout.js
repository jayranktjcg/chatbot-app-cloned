import React, { useState } from "react";
import { Grid, Drawer, useMediaQuery, useTheme, IconButton } from "@mui/material";
import ChatBotHeader from "../components/chatbot/ChatBotHeader";
import ChatBotSidebar from "../components/chatbot/ChatBotSidebar";
import ChatBotPage from "../components/chatbot/ChatBotPage";

const ChatBotLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect mobile devices

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  return (
    <Grid container sx={{ height: "100vh", flexWrap: 'nowrap' }}>
      {isMobile ? (
        <>
          <Drawer
            anchor="left"
            open={isSidebarOpen}
            onClose={toggleSidebar}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': {
                width: 250,
              },
            }}
          >
            <ChatBotSidebar />
          </Drawer>
        </>
      ) : (
        !isSidebarOpen && (
          <Grid
            item
            sx={{
              width: 300,
              minWidth: 300,
              transition: "width 0.3s ease",
              overflow: "hidden",
            }}
          >
            <ChatBotSidebar />
          </Grid>
        )
      )}

      <Grid item sx={{ flexGrow: 1, width: isMobile ? "100%" : "calc(100% - 300px)" }}>
        <Grid container direction="column" sx={{ height: "100%" }}>
          <Grid
            item
            sx={{
              padding: 1,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChatBotHeader toggleSidebar={toggleSidebar} />
          </Grid>

          <Grid
            item
            sx={{
              flexGrow: 1,
              padding: '0 8px',
              overflow: "hidden",
              width: '100%',
            }}
          >
            <ChatBotPage />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ChatBotLayout;
