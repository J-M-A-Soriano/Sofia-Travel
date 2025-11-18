import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './store';
import { Navbar, Footer, PageLayout } from './components/Layout';
import { SignInModal, SignUpModal } from './components/Modals';
import { Home } from './pages/Home';
import { Destinations } from './pages/Destinations';
import { Packages } from './pages/Packages';
import { BookingPage } from './pages/Booking';
import { Itinerary } from './pages/Itinerary';
import { Dashboard } from './pages/Dashboard';

const AppContent = () => {
  const { isSignInOpen, closeSignIn, openSignIn, isSignUpOpen, closeSignUp, openSignUp } = useAppContext();

  return (
    <>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<PageLayout fullWidth><Home /></PageLayout>} />
        <Route path="/destinations" element={<PageLayout><Destinations /></PageLayout>} />
        <Route path="/packages" element={<PageLayout><Packages /></PageLayout>} />
        <Route path="/booking/:id" element={<PageLayout><BookingPage /></PageLayout>} />
        <Route path="/itinerary" element={<PageLayout><Itinerary /></PageLayout>} />
        <Route path="/dashboard" element={<PageLayout><Dashboard /></PageLayout>} />
      </Routes>

      <Footer />

      <SignInModal 
        isOpen={isSignInOpen} 
        onClose={closeSignIn} 
        switchToOther={() => { closeSignIn(); openSignUp(); }} 
      />
      <SignUpModal 
        isOpen={isSignUpOpen} 
        onClose={closeSignUp} 
        switchToOther={() => { closeSignUp(); openSignIn(); }} 
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}

export default App;