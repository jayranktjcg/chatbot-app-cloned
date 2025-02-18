import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import { store } from './redux-store/Store';
import './App.css';
import { Slide, ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';

const App = () => {

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_CLIENT_ID}>
    <Provider store={store}>
      <Router>
        <AppRoutes />
        <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Slide}
        theme="colored"
      />
      </Router>
    </Provider>
    </GoogleOAuthProvider>
  );
}

export default App;