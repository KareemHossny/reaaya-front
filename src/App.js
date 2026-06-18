import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import PrivateRoute from './components/common/PrivateRoute';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { Toaster } from 'react-hot-toast';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// الصفحات العامة
import Home from './components/public/Home';
import About from './components/public/About';
import Services from './components/public/Services';
import Doctors from './components/public/Doctors';
import Specializations from './components/public/Specializations';
import Contact from './components/public/Contact';

// الصفحات الخاصة
import Login from './components/auth/Login';
import CompleteProfile from './components/auth/CompleteProfile';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Router>
        <Header />
        <Toaster
          position={i18n.language === 'ar' ? 'top-left' : 'top-right'}
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1a202c',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
              style: {
                background: '#f0fdf4',
                color: '#065f46',
                border: '1px solid #bbf7d0',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              style: {
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
              },
            },
          }}
        />
        <main className="flex-1">
          <Routes>
            {/* الصفحات العامة */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/specializations" element={<Specializations />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* الصفحات الخاصة */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/complete-profile" 
              element={
                <PrivateRoute>
                  <CompleteProfile />
                </PrivateRoute>
              }/>
          </Routes>
        </main>

        <Footer />
      </Router>
    </div>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <GoogleOAuthProvider clientId={'876512226850-4ndrhd4bmljlbgpsrhficp6fsths3c7g.apps.googleusercontent.com'}>
        <AuthProvider>    
          <AppContent />
        </AuthProvider>
      </GoogleOAuthProvider>
    </I18nextProvider>
  );
}

export default App;