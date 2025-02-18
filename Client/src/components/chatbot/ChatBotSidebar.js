// React Imports
import { useEffect, useState } from "react";

// MUI Imports
import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';

// Third Party Imports
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";

// Custom Imports
import CsDelete from "./CustomDelete";

// Store Imports
import { getChatHistory, deleteChatData } from "../../redux-store/Chat/ChatAction";

// Images Imports
import logo from "../../assets/icons/logogtp.svg"
import Sidebaropen from "../../assets/icons/sidebaropen.svg"
import MagicStick from "../../assets/icons/magicStick.svg"
import NewChatWhite from "../../assets/icons/newChatWhite.svg"
import FolderUntitled from "../../assets/icons/folderUntitled.svg"
import TrashWhite from "../../assets/icons/trashWhite.svg";
import TrashBlack from "../../assets/icons/trashBlack.svg";

// Helper Imports
import Colors from "../../Helper/Colors/index";

const ChatBotSidebar = () => {

  // State
  const [hasMore, setHasMore] = useState(true);
  const [deleteChat, setDeleteChat] = useState({ open: false, id: '' })
  const [isScrolling, setIsScrolling] = useState(false);

  // Hooks
  const history = useSelector((state) => state.chat.history)
  const loading = useSelector((state) => state.chat.loading)
  const pagination = useSelector((state) => state.chat.pagination)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { chat_id } = useParams()

  useEffect(() => {
    fetchChatHistory(1);
  }, []);

  const fetchChatHistory = async (page) => {
    const response = await getChatHistory({ page, limit: 25 }, dispatch);
    if (response?.status === 200) {
      const { currentPage, totalPages } = response?.data?.pagination;
      setHasMore(currentPage < totalPages);
    }
  };

  const loadMore = () => {
    if (pagination?.currentPage < pagination?.totalPages) {
      fetchChatHistory(pagination?.currentPage + 1);
    }
  };

  const handleScrollStart = () => setIsScrolling(true);
  const handleScrollEnd = () => setTimeout(() => setIsScrolling(false), 500);
  
  useEffect(() => {
    const scrollableDiv = document.getElementById("scrollableDiv");
    if (scrollableDiv) {
      scrollableDiv.addEventListener("scroll", handleScrollStart);
      scrollableDiv.addEventListener("scrollend", handleScrollEnd);
    }
    return () => {
      if (scrollableDiv) {
        scrollableDiv.removeEventListener("scroll", handleScrollStart);
        scrollableDiv.removeEventListener("scrollend", handleScrollEnd);
      }
    };
  }, []);

  const handleCreateFolderClick = () => {
    navigate('/directory')
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <Box sx={{ backgroundColor: Colors.componentbg, margin: 1, height: '100%', borderRadius: '20px', padding: 1, color: Colors.white }}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: Colors.white,
                fontSize: 22,
                fontWeight: 600,
                paddingBottom: '10px',
                paddingTop: '10px',
              }}
            >
              <img
                src={logo}
                alt="Logo"
                style={{ height: "30px", cursor: "pointer" }}
              />
            </Typography>
            <IconButton
              sx={{
                p: 0,
              }}
              className="deleteButton"
            >
              <Box component={'img'} src={Sidebaropen} />
            </IconButton>
          </Box>
          <Box>
            <Button
              variant="contained"
              onClick={() => {
                navigate('/chatbot');
              }}
              sx={{
                  width: '100%',
                  mx: 0,
                  my: '8px !important',
                  p: '7px 16px',
                  backgroundColor: Colors.black,
                  color: Colors.white,
                  fontWeight: 500,
                  fontSize: '1.1rem',
                  textTransform: 'capitalize',
                  borderRadius: '10px',
                  "&:hover": { backgroundColor: "#333" },
                  gap: 1.5,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
              }}
            >
              <Box component={'img'} src={NewChatWhite} /> New Chat
            </Button>
          </Box>
          {Object.keys(history).length === 0 ? (
            <Box
              sx={{
                height: 'calc(100dvh - 6rem)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                color: '#fff',
                padding: 2
              }}
            >
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                No chats yet
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Start a new conversation to see it here.
              </Typography>
            </Box>
          ) : (
            <Box
              id="scrollableDiv"
              sx={{
                height: 'calc(100dvh - 13rem)',
                overflow: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none', }
              }}
            >
              <Box sx={{ py: 1.5 }}>
                <InfiniteScroll
                  dataLength={Object.keys(history).length}
                  next={loadMore}
                  hasMore={hasMore}
                  loader={<Typography sx={{color: Colors.black}}>Loading...</Typography>}
                  endMessage={
                    (!isScrolling && Object.keys(history).length === 0) ? (
                      <Typography sx={{ textAlign: 'center', py: 2 }}>No more chats to load</Typography>
                    ) : null
                  }
                  scrollableTarget="scrollableDiv"
                >
                  {Object.entries(history).map(([sectionTitle, items]) => (
                    <Box key={sectionTitle} sx={{ mb: 2 }}>
                      <Typography
                        component="div"
                        sx={{ px: 1, fontSize: '0.9rem', pb: '10px', fontWeight: 600, color: Colors.calendarTitleColor }}
                      >
                        {sectionTitle}
                      </Typography>
                      <List sx={{ p: 0 }}>
                        {Array.isArray(items) &&
                          items.map((item, index) => {
                            return (
                              <ListItem key={index} disablePadding>
                                <ListItemButton
                                  onClick={() => navigate(`/chatbot/${item?.chat_id}`)}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '1rem',
                                    p: '7px 10px',
                                    m: '4px',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    bgcolor: Colors.white,
                                    color: Colors.black,
                                    // bgcolor: item?.chat_id === Number(chat_id) ? '#fff !important' : 'transparent',
                                    // color: item?.chat_id === Number(chat_id) ? '#000 !important' : '#fff',
                                    // '&:hover': {
                                    //   bgcolor: 'rgba(245, 245, 245, 0.4)',
                                    //   color: '#fff'
                                    // },
                                    '&:hover .deleteButton': { display: 'flex' }
                                  }}
                                >
                                  <ListItemText>
                                    <Box sx={{display: 'flex',gap: 1.2, alignItems: 'center'}}>
                                      <IconButton
                                        sx={{
                                          p: 0,
                                        }}
                                        className="deleteButton"
                                      >
                                        <Box component={'img'} src={MagicStick} />
                                      </IconButton>
                                      <Typography
                                        sx={{
                                          fontSize: '1rem',
                                          fontWeight: 400,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                      >
                                        {item?.title}
                                      </Typography>
                                    </Box>
                                  </ListItemText>
                                  <IconButton
                                    sx={{
                                      p: 0,
                                      display: item?.chat_id === Number(chat_id) ? 'flex !important' : 'none'
                                    }}
                                    className="deleteButton"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteChat({ open: true, id: item?.chat_id })
                                    }}
                                  >
                                    {/* <Box component={'img'} src={item?.chat_id === Number(chat_id) ? TrashBlack : TrashWhite} /> */}
                                    <Box component={'img'} src={TrashBlack} />
                                  </IconButton>
                                </ListItemButton>
                              </ListItem>
                            )
                          }
                          )}
                      </List>
                    </Box>
                  ))}
                </InfiniteScroll>
              </Box>
            </Box>
          )}
          <Box>
            <Button
              variant="contained"
              onClick={handleCreateFolderClick}
              sx={{
                  width: '100%',
                  mx: 0,
                  my: '8px !important',
                  p: '7px 16px',
                  border: `solid 1px ${Colors.borderButtonColor}`,
                  backgroundColor: Colors.transparent,
                  color: Colors.black,
                  fontWeight: 500,
                  fontSize: '1.1rem',
                  textTransform: 'capitalize',
                  borderRadius: '10px',
                  boxShadow: 'none',
                  "&:hover": { boxShadow: "none" },
                  gap: 1.5,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
              }}
            >
              <Box component={'img'} src={FolderUntitled} /> Untitled Folder
            </Button>
          </Box>
        </Box>
      </Box>

      <CsDelete
        open={deleteChat?.open}
        onClose={() => setDeleteChat({ open: false, id: '' })}
        label='Chat'
        loading={loading}
        handleDelete={async () => {
          const res = await deleteChatData(deleteChat?.id, dispatch)
          if (res?.status === 200) {
            setDeleteChat({ open: false, id: '' })
            navigate('/chatbot')
          }
        }}
      />
    </>
  );
};

export default ChatBotSidebar;