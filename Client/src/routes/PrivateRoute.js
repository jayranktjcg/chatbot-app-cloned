import React from 'react';
import { Navigate } from 'react-router-dom';
import AppUtils from '../Helper/AppUtils';

const PrivateRoute = ({ children }) => {
  const token = AppUtils.getLocalStorage("CHATBOT")
  
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
