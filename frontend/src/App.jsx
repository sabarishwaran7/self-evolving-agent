import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/Toast';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OtpPage from './pages/OtpPage';
import Dashboard from './pages/Dashboard';
import PaperGenerator from './pages/PaperGenerator';
import IdeaSearch from './pages/IdeaSearch';
import PlagiarismPage from './pages/PlagiarismPage';
import DiagramGenerator from './pages/DiagramGenerator';
import NotificationCenter from './pages/NotificationCenter';
import UserProfile from './pages/UserProfile';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [authTempPhone, setAuthTempPhone] = useState('');
  const [toasts, setToasts] = useState([]);

  // Load session from local cache on boot
  useEffect(() => {
    const handleForceLogout = () => {
      localStorage.removeItem('evolving_ai_user');
      setUser(null);
      setCurrentPage('landing');
    };
    window.addEventListener('force-logout', handleForceLogout);

    const cached = localStorage.getItem('evolving_ai_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUser(parsed);
        setCurrentPage('dashboard');
      } catch (e) {
        localStorage.removeItem('evolving_ai_user');
      }
    }
    
    return () => window.removeEventListener('force-logout', handleForceLogout);
  }, []);

  const addToast = (type, title, message) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleLogout = () => {
    localStorage.removeItem('evolving_ai_user');
    setUser(null);
    setCurrentPage('landing');
    addToast('info', 'Logged Out', 'Successfully disconnected from the evolutionary node.');
  };

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('evolving_ai_user', JSON.stringify(userData));
    setUser(userData);
    setCurrentPage('dashboard');
    addToast('success', 'Node Authenticated', `Welcome back, ${userData.displayName || 'Academic Researcher'}.`);
  };

  const renderActivePage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} user={user} />;
      case 'login':
        return (
          <LoginPage
            onNavigate={setCurrentPage}
            onLoginSuccess={handleLoginSuccess}
            onOtpRequest={(phone) => {
              setAuthTempPhone(phone);
              setCurrentPage('otp');
            }}
            addToast={addToast}
          />
        );
      case 'otp':
        return (
          <OtpPage
            phone={authTempPhone}
            onNavigate={setCurrentPage}
            onVerifySuccess={handleLoginSuccess}
            addToast={addToast}
          />
        );
      case 'dashboard':
        return <Dashboard user={user} onNavigate={setCurrentPage} addToast={addToast} />;
      case 'generator':
        return <PaperGenerator user={user} addToast={addToast} />;
      case 'ideas':
        return <IdeaSearch user={user} addToast={addToast} />;
      case 'plagiarism':
        return <PlagiarismPage user={user} addToast={addToast} />;
      case 'diagrams':
        return <DiagramGenerator user={user} addToast={addToast} />;
      case 'notifications':
        return <NotificationCenter user={user} addToast={addToast} />;
      case 'profile':
        return (
          <UserProfile
            user={user}
            onUpdateUser={(updated) => {
              const merged = { ...user, ...updated };
              setUser(merged);
              localStorage.setItem('evolving_ai_user', JSON.stringify(merged));
            }}
            onLogout={handleLogout}
            addToast={addToast}
          />
        );
      default:
        return <LandingPage onNavigate={setCurrentPage} user={user} />;
    }
  };

  // Checks if structural sidebar should render
  const showSidebar = user && !['landing', 'login', 'otp'].includes(currentPage);

  return (
    <div className="relative min-h-screen bg-space-950 text-slate-100 flex flex-col selection:bg-neon-indigo selection:text-white">
      {/* Background Cosmic Overlay Grid */}
      <div className="cosmic-grid-overlay" />

      {/* Primary Layout Wrapper */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {showSidebar && (
          <Sidebar
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
            user={user}
          />
        )}
        
        <main className={`flex-1 flex flex-col min-w-0 overflow-y-auto ${showSidebar ? 'p-4 md:p-8' : ''}`}>
          {renderActivePage()}
        </main>
      </div>

      {/* Global Animated Alerts */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}
