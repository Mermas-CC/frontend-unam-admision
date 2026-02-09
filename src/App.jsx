import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import WelcomeModal from './components/WelcomeModal';
import AdminPanel from './components/AdminPanel';
import './index.css';

function App() {
  const [theme, setTheme] = useState('dark');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;



  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('hasVisitedChatbot');
    if (!hasVisited) {
      setShowWelcomeModal(true);
    }
  }, []);

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasVisitedChatbot', 'true');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const sendMessage = async (message) => {
    if (isTyping || !message.trim()) return;
    
    const newMessages = [...messages, { role: 'user', parts: [message] }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ 
    message: message,
    history: messages 
  }),
});


      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = '';

      setMessages([...newMessages, { role: 'model', parts: [''] }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        botMessage += decoder.decode(value, { stream: true });
        setMessages([...newMessages, { role: 'model', parts: [botMessage] }]);
      }

      const separator = "---";
      const parts = botMessage.split(separator);
      let finalMessage = botMessage;
      let suggestions = [];

      if (parts.length > 1) {
        finalMessage = parts[0];
        suggestions = parts[1]
          .split('\n')
          .filter(s => s.trim().startsWith('*'))
          .map(s => s.replace('*', '').trim());
      }

      setMessages([...newMessages, { role: 'model', parts: [finalMessage], suggestedQuestions: suggestions }]);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([...newMessages, { role: 'model', parts: ['Error: No se pudo conectar con el servidor.'] }]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendExampleMessage = (message) => {
    sendMessage(message);
  };

  useEffect(() => {
    // Check for secret portal access via URL query
    const params = new URLSearchParams(window.location.search);
    if (params.get('portal') === 'admision') {
      setShowAdmin(true);
      // Clean URL after entering
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div className="app-container">
      <Sidebar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        sendExampleMessage={sendExampleMessage}
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        onAdminToggle={null} /* Access is now hidden */
        isTyping={isTyping}
      />
      <ChatArea 
        theme={theme}
        messages={messages} 
        isTyping={isTyping} 
        sendMessage={sendMessage}
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      {showWelcomeModal && (
        <WelcomeModal onClose={closeWelcomeModal} theme={theme} />
      )}
      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} theme={theme} />
      )}
    </div>
  );
}

export default App;
