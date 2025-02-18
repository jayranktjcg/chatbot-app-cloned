// React Imports
import React, { useState } from 'react';

// MUI Imports
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from '@mui/material/DialogContent';

// Third Party Imports
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { useGoogleLogin } from "@react-oauth/google";

// Store Imports
import { loginUser } from '../../redux-store/Auth/AuthAction';

// Image Imports
import logo from "../../assets/logo.png"
import profileIcon from "../../assets/header-profile.png";
import loginWithGoogle from "../../assets/loginWithGoogle.png";
import ContinueWithGoogle from "../../assets/continueWithGoogle.gif";
import GoogleIcon from "../../assets/icons/googleIcon.svg";

// Helper Imports
import Colors from '../../Helper/Colors';
import UrlHelper from '../../Helper/Url';
import AppUtils from '../../Helper/AppUtils';

const LandingHeader = () => {

  // State
  const [open, setOpen] = useState(false);

  // Hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClickOpen = () => {
    const chatbotToken = AppUtils.getLocalStorage("CHATBOT")?.token;
    
    if (chatbotToken) {
      navigate('/chatbot');
    } else {
      setOpen(true);
    }
  };

  const handleClose = () => setOpen(false);

 

  // const handleLoginSuccess = async (credentialResponse) => {
  //   const decoded = jwtDecode(credentialResponse.credential);
  //   const userData = {
  //     email: decoded.email,
  //     name: decoded.name,
  //     given_name: decoded.given_name,
  //     family_name: decoded.family_name,
  //     profile_picture: decoded.picture,
  //   }
  //   const res = await loginUser(userData, dispatch)
  //   if (res?.status === 200) {
  //     handleClose()
  //     navigate('/chatbot')
  //   }

  // };

  // const handleLoginError = () => {
  //   console.log("Login Failed");
  // }

  
  const handleLoginSuccess = async (tokenResponse) => {
    try {
      // Check if the token is available
      const accessToken = tokenResponse.access_token;

      if (!accessToken) {
        throw new Error('Access token is missing.');
      }

      // Fetch user info using Google's UserInfo API
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const userInfo = await userInfoResponse.json();

      const userData = {
        email: userInfo.email,
        name: userInfo.name,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        profile_picture: userInfo.picture,
      };

      const res = await loginUser(userData, dispatch);
      if (res?.status === 200 || res?.status === 201) {
        handleClose();
        navigate('/chatbot');
      }
    } catch (error) {
      console.error('Decoding or login failed:', error);
    }
  };

  const handleLoginError = () => {
    console.log("Login Failed");
  };

  const login = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    onError: handleLoginError,
    flow: 'implicit',
  });


  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: Colors.white }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: Colors.black,
              fontSize: 22,
              fontWeight: 600,
            }}
            onClick={() => navigate('/')}
          >
            <img
              src={logo}
              alt="Logo"
              style={{ height: "40px", cursor: "pointer" }}
            />
            SelectQuote
          </Typography>
          <Box>
              <IconButton onClick={handleClickOpen} id="g_id_onload"
              data-client_id={process.env.REACT_APP_CLIENT_ID}
              data-login_uri={`${UrlHelper.mediaURL}chatbot`}
              use_fedcm_for_prompt='true'>
                <Avatar sx={{ bgcolor: Colors.orange }} src={profileIcon}></Avatar>
              </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogContent sx={{ padding: '0 !important', maxWidth: '400px'}}>
          <Box sx={{textAlign: 'center'}}>
            <img
              src={loginWithGoogle}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <img
              src={ContinueWithGoogle}
              style={{ width: '80px', cursor: 'pointer' }}
            />
            <Box sx={{py: 3}}>
              <Typography sx={{
                  color: Colors.black,
                  fontSize: 26,
                  fontWeight: 600,
                }}>
                  Welcome to ChatAI
              </Typography>
              <Typography sx={{
                  color: Colors.black,
                  fontSize: 18,
                  fontWeight: 600,
                }}>
                  Learn faster, smarter, and better
              </Typography>
            </Box>
            <Box sx={{px:'1rem'}}>

              <Button 
              onClick={() => login()}
              variant="contained" 
              fullWidth
              sx={{
                fontSize: 16,
                fontWeight: 500,
                backgroundColor: Colors.black,
                color: Colors.white,
                borderRadius: 50,
                mb: 2,
                textTransform: 'capitalize'
              }} 
              id="g_id_onload"
              startIcon={<img
                src={GoogleIcon}
                style={{ height: '30px', cursor: 'pointer' }}
            />}
              >
                
                Login With Google
              </Button>
            </Box>
            </Box>
        </DialogContent>
      </Dialog>
      {/* <Modal
        open={open}
        onClose={handleClose}
        maxWidth='md'
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 512, height: '100%' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', textAlign: 'center' }}>
          <img
            src={loginWithGoogle}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <Box component={'img'}
            src={ContinueWithGoogle}
            sx={{ width: '80px', cursor: 'pointer', mx: 'auto', my: '1rem' }}
          />
          <Box sx={{ pb: '1rem' }}>
            <Typography
              sx={{
                color: Colors.black,
                fontSize: 26,
                fontWeight: 600,
              }}
            >
              Welcome to ChatAI
            </Typography>
            <Typography
              sx={{
                color: Colors.black,
                fontSize: 18,
                fontWeight: 600,
              }}>
              Learn faster, smarter, and better
            </Typography>
          </Box>
          <Box sx={{ position: 'relative', "&>div": { position: 'absolute', width: '80%', zIndex: '9', opacity: 0, } }}>
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              style={{ position: 'absolute', width: '80%' }}
            />
            <Button variant="outlined" sx={{
              width: '80%',
              margin: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              fontSize: 16,
              fontWeight: 500,
              backgroundColor: Colors.black,
              color: Colors.white,
              borderRadius: 50,
              p: 1,
              mb: 2
            }}>
              <img
                src={GoogleIcon}
                style={{ height: '30px', cursor: 'pointer' }}
              />
              Login With Google
            </Button>
          </Box>
        </Box>
      </Modal> */}
    </>
  )
}
export default LandingHeader;