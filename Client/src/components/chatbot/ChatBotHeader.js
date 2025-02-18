import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from "react-redux";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Colors from "../../Helper/Colors/index";
import { Avatar } from '@mui/material';
import profileIcon from '../../assets/header-profile.png'
import LeftArrow from '../../assets/icons/leftArrow.svg'
import NewChat from '../../assets/icons/newChat.svg'
import CreateFolderIcon from '../../assets/icons/createFolderIcon.svg'
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import AppUtils from '../../Helper/AppUtils';
import CreateFolderDialog from '../directory/CreateFolderDialog';

const ChatBotHeader = ({ toggleSidebar }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    AppUtils.removeLocalStorageItem('CHATBOT')
    navigate('/');
  };

  useEffect(() => {
    const token = AppUtils.getLocalStorage('CHATBOT');
    if (token) {
      try {
        setUser(token);
      } catch (error) {
        localStorage.removeItem("authToken");
      }
    }
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: Colors.transparent, borderRadius: '20px',boxShadow:'none' }}>
        <Toolbar sx={{p:"0 !important"}}>
          {/* <IconButton
            size="medium"
            aria-label="menu"
            sx={{
              backgroundColor: Colors.white,
              "&:hover": {
                backgroundColor: Colors.white,
              },
              width: '40px',
              height: '40px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onClick={toggleSidebar}
          >
            <img
              src={LeftArrow}
              style={{ height: '17px', cursor: 'pointer' }}
            />
          </IconButton>
          <IconButton
            size="medium"
            aria-label="menu"
            sx={{
              ml: 1,
              backgroundColor: Colors.white,
              "&:hover": {
                backgroundColor: Colors.white,
              },
              width: '40px',
              height: '40px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onClick={() => {
              navigate('/chatbot');
            }
            }
          >
            <img
              src={NewChat}
              style={{ height: '17px', cursor: 'pointer' }}
            />
          </IconButton>
          <IconButton
            size="medium"
            aria-label="menu"
            sx={{
              ml: 1,
              backgroundColor: Colors.white,
              "&:hover": {
                backgroundColor: Colors.white,
              },
              width: '40px',
              height: '40px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onClick={handleCreateFolderClick}
          >
            <img
              src={CreateFolderIcon}
              style={{ height: '17px', cursor: 'pointer' }}
            />
          </IconButton> */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: Colors.black }}>
          Class GPT
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
            <Tooltip title="Account settings" arrow>
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                {user ? (
                  <Avatar sx={{ backgroundColor: Colors.orange }} src={user.profile_picture}></Avatar>
                ) : (
                  <Avatar sx={{ backgroundColor: Colors.orange }} src={profileIcon}></Avatar>
                )}
              </IconButton>
            </Tooltip>
          </Box>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleClose}>
              {user ? (
                <Avatar sx={{ backgroundColor: Colors.orange }} src={user.profile_picture}></Avatar>
              ) : (
                <Avatar sx={{ backgroundColor: Colors.orange }} src={profileIcon}></Avatar>
              )}
              <Typography sx={{ fontWeight: 500 }}>
                {user ? `${user.first_name} ${user.last_name}` : "Profile"}
              </Typography>
            </MenuItem>
            {/* <MenuItem onClick={handleClose}>
              <Avatar /> My account
            </MenuItem> */}
            <Divider />
            {/* <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <PersonAdd fontSize="small" />
              </ListItemIcon>
              Add another account
            </MenuItem> */}
            {/* <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem> */}
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
          {/* <IconButton>
            <Avatar sx={{ bgcolor: Colors.orange }} src={profileIcon}></Avatar>
          </IconButton> */}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default ChatBotHeader;