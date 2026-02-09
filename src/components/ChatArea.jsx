import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaUser, FaRobot, FaBars } from 'react-icons/fa';

const ChatArea = ({ theme, messages, isTyping, sendMessage, toggleSidebar, sidebarOpen }) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Reset isSending when typing stops
  useEffect(() => {
    if (!isTyping) {
      setIsSending(false);
    }
  }, [isTyping]);

  const handleSend = () => {
    if (input.trim() && !isSending && !isTyping) {
      setIsSending(true);
      sendMessage(input);
      setInput('');
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestionClick = (question) => {
    if (!isSending && !isTyping) {
      setIsSending(true);
      sendMessage(question);
    }
  };

  const renderSuggestions = (suggestions) => {
    return (
      <div className="suggestion-chips">
        {suggestions.map((text, idx) => (
          <button
            key={idx}
            className="suggestion-chip"
            onClick={() => handleSuggestedQuestionClick(text)}
            disabled={isSending || isTyping}
          >
            {text}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="chat-area">
      <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
        <FaBars />
      </button>
      <div 
        className={`overlay ${sidebarOpen ? 'active' : ''}`} 
        onClick={toggleSidebar}
      ></div>
      <main className={`messages-area ${messages.length === 0 ? 'centered-vertical' : ''}`} id="messages-area">
        <div id="chat-box-container">
          <div id="chat-box">
            {messages.length === 0 ? (
              <div className="welcome-section" id="welcome-section">
                <h1 className="welcome-title">¿Cómo puedo ayudarte hoy?</h1>
                <div className="input-wrapper flex items-center">
                  <textarea 
                    id="user-input-welcome" 
                    className="message-input no-scrollbar" 
                    placeholder="Escribe tu mensaje..." 
                    rows="1"
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                  ></textarea>
                  <button id="send-btn-welcome" className="send-button flex items-center justify-center" onClick={handleSend} disabled={!input.trim() || isTyping || isSending}>
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages
                  .filter((msg, index) => !(isTyping && index === messages.length - 1 && msg.role === 'model' && msg.parts[0] === ''))
                  .map((msg, index) => (
                    <div key={index} className={`message-wrapper ${msg.role}`}>
                      <div className="avatar">{msg.role === 'user' ? <FaUser /> : <FaRobot />}</div>
                      <div className="bot-message-container">
                        <div className="message-content" dangerouslySetInnerHTML={{ __html: msg.role === 'user' ? msg.parts[0] : window.marked.parse(msg.parts[0]) }}></div>
                        {msg.role === 'model' && msg.suggestedQuestions && renderSuggestions(msg.suggestedQuestions)}
                      </div>
                    </div>
                  ))}
                {isTyping && (
                  <div className="message-wrapper bot typing-indicator">
                    <div className="avatar"><FaRobot /></div>
                    <div className="message-content">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
      </main>

      {messages.length > 0 && (
        <footer id="input-dock">
          <div className="input-wrapper flex items-center">
            <textarea 
              id="user-input" 
              className="message-input no-scrollbar" 
              placeholder="Escribe tu mensaje..." 
              rows="1"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            ></textarea>
            <button id="send-btn" className="send-button flex items-center justify-center" onClick={handleSend} disabled={!input.trim() || isTyping || isSending}>
              <FaPaperPlane />
            </button>
          </div>
          {!sidebarOpen && (
            <div className="developed-by-docked">
              <p>Developed by:</p>
              <img 
                src={theme === 'light' ? '/logo_aimara_dark.png' : '/logo_aimara_white.png'} 
                alt="Aimara Lab" 
                className="developed-by-logo-tiny"
              />
            </div>
          )}
        </footer>
      )}
      {messages.length === 0 && !sidebarOpen && (
        <div className="developed-by-folded">
          <p>Developed by:</p>
          <img 
            src={theme === 'light' ? '/logo_aimara_dark.png' : '/logo_aimara_white.png'} 
            alt="Aimara Lab" 
            className="developed-by-logo-small"
          />
        </div>
      )}
    </div>
  );
};

export default ChatArea;
