import React from 'react';
import LandingHeader from '../components/landing/LandingHeader';
import LandingPage from '../components/landing/LandingPage';
import Chatbk from '../components/chatbot/Chatbk';

const LandingLayout = () => {
  return (
    <>
      <LandingHeader />
      <main className="container">
        <LandingPage />
        {/* <Chatbk /> */}
      </main>
    </>
  )
};

export default LandingLayout;